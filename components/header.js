import React, {useCallback} from 'react';
import Link from 'next/link'

export default function Header () {

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    window.location.href = "/login";
  }, []);

  return (
    <nav className="header">
      <div className="left">
	<Link href="/">
	  <a>Videos</a>
	</Link>
    	&nbsp;
    	&nbsp;
	<Link href="/categories">
	  <a>Categories</a>
	</Link>
      </div>
      <div className="right">
	<button onClick={signOut}>Logout</button>
      </div>
    </nav>
  )
}
