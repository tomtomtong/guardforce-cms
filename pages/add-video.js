import React, {useState, useCallback, useEffect, useRef} from 'react';
import Header from '../components/header';
import axios from "axios";
import Link from 'next/link'

export default function AddVideo() {
  const thumbnailRef = useRef(null);
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [done, setDone] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [allCategories, setAllCategories] = useState([
    'Tuen Mun', 'Yuen Long', 'Tsuen Wan', 'North', 'Tai Po', 'Sha Tin', 'Sai Kung',
    'Islands', 'Kwai Tsing', 'Sham Shui Po', 'Yau Tsim Mong', 'Kowloon City', 'Wong Tai Sin', 'Kwun Tong',
    'Central and Western', 'Wan Chai', 'Southern', 'Eastern', 'Others'
  ]);
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);

  const thumbnailChange = useCallback((e) => {
    if (e.target.files.length === 0) return;
    console.log("Thumbnail selected:", e.target.files[0]); // Log selected thumbnail
    setThumbnail(e.target.files[0]);
  }, [setThumbnail]);

  const videoChange = useCallback((e) => {
    if (e.target.files.length === 0) return;
    console.log("Video selected:", e.target.files[0]); // Log selected video
    setVideo(e.target.files[0]);
  }, [setVideo]);

  const reset = useCallback(() => {
    console.log("Resetting form..."); // Log reset action
    setName('');
    setCategory('');
    setThumbnail(null);
    setVideo(null);
    setDone(false);
    setProgress('');
    setError('');
    thumbnailRef.current.value = "";
    videoRef.current.value = "";
  }, [setDone, setProgress, setError, setVideo, setThumbnail, setCategory, setName]);

  const submit = useCallback(async () => {
    const token = localStorage.getItem('token');
    console.log("Submitting form with data:", { name, category, selectedCategory, thumbnail, video }); // Log submission data

    setError('');
    if (!category && !selectedCategory) {
      setError("missing category");
      console.error("Error: missing category"); // Log error
      return;
    }
    if (!name) {
      setError("missing name");
      console.error("Error: missing name"); // Log error
      return;
    }
    if (!thumbnail) {
      setError("missing thumbnail");
      console.error("Error: missing thumbnail"); // Log error
      return;
    }
    if (!video) {
      setError("missing video");
      console.error("Error: missing video"); // Log error
      return;
    }

    setProgress('preparing upload...');
    try {
      const result = await axios.post('/api/get-upload-files-url', {
        thumbnailName: thumbnail.name,
        videoName: video.name,
        token
      });
      console.log("Upload file URLs received:", result.data); // Log received URLs
      const {assetId, thumbnailURL, videoURL} = result.data;

      const uploadRes1 = await axios.put(thumbnailURL, thumbnail, {
        headers: {'x-amz-acl': 'public-read'},
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress('uploading thumbnail (' + percent + '%)');
        }
      });
      console.log("Thumbnail upload response:", uploadRes1); // Log thumbnail upload response

      const uploadRes2 = await axios.put(videoURL, video, {
        headers: {'x-amz-acl': 'public-read'},
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress('uploading video (' + percent + '%)');
        }
      });
      console.log("Video upload response:", uploadRes2); // Log video upload response

      setProgress('submitting...');
      const submitResult = await axios.post('/api/add-video', {
        assetId,
        category: category || selectedCategory,
        name,
        thumbnailURL,
        videoURL,
        thumbnailSize: thumbnail.size,
        videoSize: video.size,
        token
      });
      console.log("Submission result:", submitResult); // Log submission result

      setProgress('');
      setDone(true);

    } catch (err) {
      console.error("Post error:", err); // Log error details
      setError("failed to submit");
      setProgress('');
    }
  }, [name, selectedCategory, category, thumbnail, video, setError, setProgress, setDone]);

  return (
    <div>
      <Header/>
      <div className="container">
        <Link href="/">
          <a>Back</a>
        </Link>
        <h1>Add Video</h1>

        <table>
          <tbody>
            <tr>
              <td>Category</td>
              <td>
                <select onChange={(e) => {setSelectedCategory(e.target.value); setCategory('')}}>
                  <option value="">Select</option>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                &nbsp; OR &nbsp;
                {/* <input type="text" placeholder="new category" value={category} onChange={(e) => {setCategory(e.target.value)}}/> */}
              </td>
            </tr>
            <tr>
              <td>Name</td>
              <td><input type="text" value={name} onChange={(e) => {setName(e.target.value)}}/></td>
            </tr>
            <tr>
              <td>Thumbnail</td>
              <td><input type="file" ref={thumbnailRef} onChange={thumbnailChange}/></td>
            </tr>
            <tr>
              <td>Video</td>
              <td><input type="file" ref={videoRef} onChange={videoChange}/></td>
            </tr>
          </tbody>
        </table>

        {done && (
          <div>
            Upload successful.
            <div>
              <button onClick={reset}>Upload Another One</button>
            </div>
          </div>
        )}

        {!done && 
          <button onClick={submit} disabled={progress !== ''}>Submit</button>
        }

        {progress !== '' && 
          <div className="progress">
            {progress}
          </div>
        }

        <div className="error">
          {error}
        </div>
      </div>
    </div>
  )
}
