import React, { useState } from 'react';
import sha1 from 'sha1'
import { lookUp } from './middleware';

const States = {
  INIT:"No request has been made",
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR"
}

const processData = (data,hash) => {
  const head = hash.slice(0,5)
  return data
  .split("\n")
  .map(x => x.split(":"))
  .map( ([h,count]) =>[ `${head}${h}`,count])
}

function App() {
  const [state, setState] = useState(States.INIT);
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [data, setData] = useState(undefined);

  const handleChange = e => {
    setPassword(e.target.value);
  }

  const handleSubmit = async e => {
    e.preventDefault();
    const hashed = sha1(password).toUpperCase();
    setHash(hashed);
    setState(States.LOADING)
    const res = await lookUp(hashed);
    const prom = res.map( x => x.text() ).onFailure( x => new Promise((r,re) => re(x)))
    prom.then( data => {
      setState(States.SUCCESS);
      setData(processData(data,hashed))
    })
    .catch(e => {
      setState(States.ERROR)
      console.error(e)
      setData(e)
    })
    setPassword("");
  }

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <input value={password} onChange={handleChange} />
        <button>Submit</button>
      </form>
  <div>Status: {state}</div>
      { hash && <div>Hash: {hash}</div>}
      { state === States.SUCCESS && <>
        <div>
          
          {
            data && data.find(([h]) => h === hash) ?  
          <h4>Your password has been found {
            data.find(([h]) => h === hash)[1]
            } times. <strong>Not safe</strong></h4>
            : 
            <h4>Your password is not anywhere in the database. <strong>Probably</strong> safe.</h4>
          }
        </div>
        <ul>
          <h3>Results from API (total of {data?.length || 0}):</h3>
          {data ? data.map(([hash,count]) => <li key={hash}>{hash}: {count}</li>) : <li>Nothing found</li>}
        </ul>
        </>
      }
    </div>
  );
}

export default App;
