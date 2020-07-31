import React, { useState, useContext } from 'react'
import {
  Input, Button, InputAdornment, Container,
  FormControl, InputLabel, OutlinedInput,
  makeStyles,
} from '@material-ui/core'
import {
  ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon,
} from '@material-ui/icons'
import { TreeView, TreeItem } from '@material-ui/lab'
import CID from 'cids'
import IPFSContext from './IPFSContext'
import Diff from './Diff'

const useStyles = makeStyles((theme) => ({
  input: {
    margin: '1em 2em',
  },
  tick: {
    display: 'inline-block',
    minWidth: '3em',
    textAlign: 'center',
  },
  content: {
    width: '100%',
    minHeight: '65em',
  },
}))

const shortCID = (cid) => `${cid.slice(0, 8)}…${cid.slice(-8)}`

export default () => {
  const params = new URLSearchParams(window.location.search)
  const [cidOne, setCIDOne] = useState(
    params.get('from') || 'QmQHfgtBPbHZ2hBdk6TENupC9U4UdHzv7dQ45byAxy8fv1'
  )
  const [cidTwo, setCIDTwo] = useState(
    params.get('to') || 'QmXJY6LBVdQjzpCwq8Vx5aJcC3zhDpZ74UWQ3rcP6X91NU'
  )
  const [error, setError] = useState()
  const [diff, setDiff] = useState()
  const [files, setFiles] = useState([])
  const [ipfs] = useContext(IPFSContext)
  const classes = useStyles()

  if(error) {

  }
  
  const ls = async (cid) => {
    const entries = []
    if(!cid) return []
    for await (const file of ipfs.ls(cid)) {
      entries.push(file)
    }
    return entries
  }

  /* Development Steps:
   *  1. Catch changed files
   *  2. Explore subdirectories
   *  3. Handle added files
   *  4. Handle removed files
   *  5. Handle renamed files
   */
  const compareStart = async (one, two) => {
    const title = <>
      Comparing <span onClick={() => diffFor(undefined, two)} title={two}>{shortCID(two)}</span>
      <span> </span>to <span title={one}>{shortCID(one)}</span>
    </>
    const root = { name: title, children: await compare(one, two) }
    console.info(root)
    setFiles([root])
  }

  const compare = async (one, two) => {
    const cids = {}
    const entriesOne = await ls(one)
    const entriesTwo = await ls(two)
    const files = {}

    for(let entry of entriesOne) {
      files[entry.name] = {
        cidOne: entry.cid, type: entry.type,        
      }
    }
    for(let entry of entriesTwo) {
      if(!files[entry.name]) files[entry.name] = {}
      if(files[entry.name].type && files[entry.name].type !== entry.type) {
        throw 'Entry changed type. Not supported.'
      }
      files[entry.name].type = entry.type
      files[entry.name].cidTwo = entry.cid
    }

    const fileList = []
    for(let name of Object.keys(files)) {
      const file = files[name]
      file.name = name
      if(file.type === 'dir') {
        file.children = await compare(file.cidOne, file.cidTwo)
      }
      fileList.push(file)
    }
    return fileList
  }

  const mark = (cidOne, cidTwo) => {
    if(!cidOne && !cidTwo) {
      return <>
        <span className={classes.tick}>From</span>
        <span className={classes.tick}>To</span>
      </>
    } else if(cidOne && !cidTwo) {
      return <>
        <span className={classes.tick} title={cidOne}>✖</span>
        <span className={classes.tick}></span>
      </>
    } else if(!cidOne && cidTwo) {
      return <>
        <span className={classes.tick}></span>
        <span className={classes.tick} title={cidTwo}>✖</span>
      </>
    } else if(cidOne.equals(cidTwo)) {
      return <>
        <span className={classes.tick} title={cidOne}>✔</span>
        <span className={classes.tick} title={cidTwo}>✔</span>
      </>
    } else {
      return <>
        <span className={classes.tick} title={cidOne}>✖</span>
        <span className={classes.tick} title={cidTwo}>✖</span>
      </>
    }
  }

  const diffFor = (one, two, filename) => {
    if(one && !two) {
      return <>
        <h1>Removed</h1>
        <iframe
          className={classes.content}
          style={{backgroundColor: 'rgba(255, 0, 0, 0.25)'}}
          sandbox=''
          src={`//ipfs.io/ipfs/${one}`}
        />
      </>
    } else if(!one && two) {
      return <>
        <h1>Added</h1>
        <iframe
          className={classes.content}
          style={{backgroundColor: 'rgba(0, 255, 0, 0.25)'}}
          sandbox=''
          src={`//ipfs.io/ipfs/${two}`}
        />
      </>
    } else if(one.equals(two)) {
      return <>
        <h1>No Changes</h1>
        <iframe
          className={classes.content}
          sandbox=''
          src={`//ipfs.io/ipfs/${one}`}
        />
      </>
    } else {
      return <Diff from={one} to={two} filename={filename}/>
    }
  }

  const fileItem = (file, depth = 1) => (
    <TreeItem key={file.name} nodeId={`${depth}-${file.name}`}
      label={
        <div style={{display: 'flex'}}>
          <span>{file.name}</span>
          <span style={{flexGrow: 10, textAlign: 'right', marginRight: '1em'}}>
            {mark(file.cidOne, file.cidTwo)}
          </span>
        </div>
      }
      onClick={() => file.type === 'file' && setDiff(diffFor(file.cidOne, file.cidTwo, file.name))}
    >
      {file.children ? file.children.map(child => fileItem(child, depth + 1)) : null}
    </TreeItem>
  )


  let validInput = false
  try {
    validInput = !!(new CID(cidOne) && new CID(cidTwo))
  } catch(e) {}

  return (
    <Container>
      <span style={{marginRight: '1ex'}}>Replace</span>
      <FormControl fullWidth className={classes.input} variant="outlined">
        <InputLabel htmlFor='fromCID'>From</InputLabel>
        <OutlinedInput
          id='fromCID'
          placeholder='Origin Content Identifier'
          value={cidOne}
          onChange={evt => setCIDOne(evt.target.value)}
          color='primary'
          startAdornment={<InputAdornment position='start'>CID:</InputAdornment>}
          labelWidth={50}
        />
      </FormControl>
      <span style={{margin: 'auto 1ex'}}>with</span>
      <FormControl fullWidth className={classes.input} variant="outlined">
        <InputLabel htmlFor='toCID'>To</InputLabel>
        <OutlinedInput
          id='toCID'
          placeholder='Replacement Content Identifier'
          value={cidTwo}
          startAdornment={<InputAdornment position="start">CID:</InputAdornment>}
          onChange={evt => setCIDTwo(evt.target.value)}
          color='primary'
          labelWidth={25}
        />
      </FormControl>
      <Button
        disabled={!validInput}
        color='primary'
        variant='contained'
        onClick={() => compareStart(cidOne, cidTwo)}
      >Diff {shortCID(cidOne)} &amp; {shortCID(cidTwo)}</Button>
      <hr style={{width: '65%', margin: '2em auto', border: '2px solid'}}/>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['root']}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {files.map(file => fileItem(file))}
      </TreeView>
      {diff}
    </Container>
  )
}