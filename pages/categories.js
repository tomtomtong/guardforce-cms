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
  const [categories, setCategories] = useState([
    { id: 1, name: 'Tuen Mun', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 2, name: 'Yuen Long', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 3, name: 'Tsuen Wan', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 4, name: 'North', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 5, name: 'Tai Po', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 6, name: 'Sha Tin', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 7, name: 'Sai Kung', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 8, name: 'Islands', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 9, name: 'Kwai Tsing', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 10, name: 'Sham Shui Po', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 11, name: 'Yau Tsim Mong', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 12, name: 'Kowloon City', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 13, name: 'Wong Tai Sin', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 14, name: 'Kwun Tong', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 15, name: 'Central and Western', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 16, name: 'Wan Chai', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 17, name: 'Southern', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 18, name: 'Eastern', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
    { id: 19, name: 'Others', thumbnailSize: 0, thumbnailURL: '', createdAt: new Date().toISOString() },
  ]);

  const [deleting, setDeleting] = useState(false);

  const totalSize = useMemo(() => {
    let sum = 0;
    categories.forEach((category) => {
      sum += category.thumbnailSize;
    });
    return sum;
  }, [categories]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Categories</title>
        <meta name="description" content="GaurdForce" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header/>

      <div className="container">
    	<div className="top">
	  <div className="left">
	    {categories.length > 0 && (
	      <span className="summary">
		Items: {categories.length}, Total Size: {humanFileSize(totalSize)}
	      </span>
	    )}
	  </div>
	  <div className="right">
	    {/* <Link href="/add-category"> */}
	    {/* <a>Add Category</a> */}
	    {/* </Link> */}
	  </div>
	</div>

    	<table className="table">
	  <thead className="thead-dark">
    	    <tr>
    	      <th>#</th>
    	      <th>Name</th>
    	      <th>Thumbnail</th>
    	      <th>Created At</th>
    	      <th></th>
	    </tr>
	  </thead>
    	  <tbody>
	    {categories.map((category, index) => (
	      <tr key={category.id}>
		<td>
	          {index + 1}
		</td>
		<td>
		  {category.name}
		</td>
		<td>
		  <a rel="noreferrer" href={category.thumbnailURL} target="_blank">Link</a> ({humanFileSize(category.thumbnailSize)})
		</td>
		<td>
	      	  {category.createdAt}
		</td>
		<td>
	      	  {/* <button onClick={() => deleteCategory(category)} disabled={deleting}>Delete</button> */}
		</td>
	      </tr>
	    ))}
	  </tbody>
	</table>
      </div>
    </div>
  )
}

