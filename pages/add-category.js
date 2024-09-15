import React, {useState, useCallback, useEffect, useRef} from 'react';
import Header from '../components/header';
import axios from "axios";
import Link from 'next/link'

export default function AddCategory() {
  const thumbnailRef = useRef(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [done, setDone] = useState(false);
  const [name, setName] = useState('');
  const [thumbnail, setThumbnail] = useState(null);

  const thumbnailChange = useCallback((e) => {
    if (e.target.files.length === 0) return;
    setThumbnail(e.target.files[0]);
  }, [setThumbnail]);

  const reset = useCallback(() => {
    setName('');
    setThumbnail(null);
    setDone(false);
    setProgress('');
    setError('');
    thumbnailRef.current.value = "";
  }, [setDone, setProgress, setError, setThumbnail, setName]);

  const submit = useCallback(async () => {
    const token = localStorage.getItem('token');

    setError('');
    if (!name) {
      setError("missing name");
      return;
    }
    if (!thumbnail) {
      setError("missing thumbnail");
      return;
    }

    setProgress('preparing upload...');
    try {
      const result = await axios.post('/api/get-upload-files-url', {
	thumbnailName: thumbnail.name,
	videoName: thumbnail.name, // dummy
	token
      });
      const {assetId, thumbnailURL} = result.data;

      const uploadRes1 = await axios.put(thumbnailURL, thumbnail, {
	headers: {'x-amz-acl': 'public-read'},
	onUploadProgress: (progressEvent) => {
	  const percent = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
	  setProgress('uploading thumbnail (' + percent + '%)');
	}
      });

      setProgress('submitting...');
      const submitResult = await axios.post('/api/add-category', {
	assetId,
	name,
	thumbnailURL,
	thumbnailSize: thumbnail.size,
	token
      });

      setProgress('');
      setDone(true);
    } catch (err) {
      console.log("post error", err);
      setError("failed to submit");
      setProgress('');
    }
  }, [name, thumbnail, setError, setProgress, setDone]);

  return (
    <div>
      <Header/>
      <div className="container">
	<Link href="/categories">
	  <a>Back</a>
	</Link>
    	<h1>Add Category</h1>

    	<table>
    	  <tbody>
	    <tr>
	      <td>Category</td>
	      <td><input type="text" value={name} onChange={(e) => {setName(e.target.value)}}/></td>
	    </tr>
	    <tr>
	      <td>Thumbnail</td>
	      <td><input type="file" ref={thumbnailRef} onChange={thumbnailChange}/></td>
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
