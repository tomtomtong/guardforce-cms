import React, {useMemo, useCallback, useEffect, useState} from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import axios from "axios";
import Header from '../components/header';
import jwt from 'jsonwebtoken';
import Link from 'next/link'

const humanFileSize = (size) => {
  var i = Math.floor( Math.log(size) / Math.log(1024) );
  return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchVideos = useCallback(() => {
    axios.get('/api/get-videos').then((res) => {
      const videos = res.data && res.data.videos || [];
      setVideos(videos);
      setDeleting(false);
    });
  }, [setVideos, setDeleting]);

  const deleteVideo = useCallback(async (video) => {
    const token = localStorage.getItem('token');
    if (confirm("confirm delete " + video.name + "?")) {
      setDeleting(true);
      try {
	const result = await axios.post('/api/delete-video', {
	  videoId: video.id,
	  token
	});
      } catch (e) {
	console.log("e", e);
      }
      fetchVideos();
    }
  }, [fetchVideos, setDeleting]);

  const categories = useMemo(() => {
    const categoryKeys = {};
    videos.forEach((video) => {
      categoryKeys[video.category] = true;
    });
    return Object.keys(categoryKeys);
  }, [videos]);

  const selectedCategoryChanged = useCallback((e) => {
    setSelectedCategory(e.target.value);
  }, [setSelectedCategory]);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === '') return videos;

    return videos.filter((video) => {
      return video.category === selectedCategory;
    });
  }, [videos, selectedCategory]);

  const totalSize = useMemo(() => {
    let sum = 0;
    videos.forEach((video) => {
      sum += video.videoSize;
      sum += video.thumbnailSize;
    });
    return sum;
  }, [videos]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = "/login";
    }
    fetchVideos();
  }, [fetchVideos]);
  
  return (
    <div>
      <Head>
        <title>Videos</title>
        <meta name="description" content="GuardForce Videos" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header/>

      <div className="container">
    	<div className="top">
	  <div className="left">
	    <select onChange={selectedCategoryChanged}>
    	      <option value="">All</option>
    	      {categories.map((category) => (
		<option key={category} value={category}>{category}</option>
	      ))}
	    </select>

    	    {videos.length > 0 && (
	      <span className="summary">
		Items: {videos.length}, Total Size: {humanFileSize(totalSize)}
	      </span>
	    )}
	  </div>
	  <div className="right">
	    <Link href="/add-video">
	      <a>Add</a>
	    </Link>
	  </div>
	</div>

    	<table className="table">
	  <thead className="thead-dark">
    	    <tr>
    	      <th>#</th>
    	      <th>Category</th>
    	      <th>Name</th>
    	      <th>Thumbnail</th>
    	      <th>Video</th>
    	      <th>Created At</th>
    	      <th></th>
	    </tr>
	  </thead>
    	  <tbody>
	    {filteredVideos.map((video, index) => (
	      <tr key={video.id}>
		<td>
	          {index + 1}
		</td>
		<td>
	      	  {video.category}
		</td>
		<td>
		  {video.name}
		</td>
		<td>
		  <a rel="noreferrer" href={video.thumbnailURL} target="_blank">Link</a> ({humanFileSize(video.thumbnailSize)})
		</td>
		<td>
		  <a rel="noreferrer" href={video.videoURL} target="_blank">Link</a> ({humanFileSize(video.videoSize)})
		</td>
		<td>
	      	  {video.createdAt}
		</td>
		<td>
	      	  <button onClick={() => deleteVideo(video)} disabled={deleting}>Delete</button>
		</td>
	      </tr>
	    ))}
	  </tbody>
	</table>
      </div>
    </div>
  )
}
