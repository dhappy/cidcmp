import React, { useState, useContext } from 'react'
import { makeStyles } from '@material-ui/core'
import ReactMarkdown from 'react-markdown'
import IPFSContext from '../IPFSContext'
import Comment from './Comment'

const useStyles = makeStyles((theme) => ({
  line: {
    width: '50%',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 0, 0.25)',
    }
  },
  link: {
    display: 'grid',
    gridTemplateColumns: '3em calc(100% - 3em)',
  },
  pre: {
    whiteSpace: 'pre',
  },
  number: {
    paddingLeft: '0.25em',
    border: '1px solid rgba(0, 0, 0, 0.25)',
  },
  text: {
    paddingLeft: '0.25em',
    border: '1px solid rgba(0, 0, 0, 0.25)',
  },
}))

export default ({ num, text, type, filename }) => {
  const [ipfs] = useContext(IPFSContext)
  const [showComment, setShowComment] = useState(false)
  const [comment, setComment] = useState()
  const [tabIndex, setTabIndex] = useState(0)
  const classes = useStyles()

  const writeComment = async () => {
    //const pr = (await ipfs.dag.get(pr))
    const pr = {}
    const holder = ['comments', type].reduce((obj, step) => (
      obj[step] = obj[step] || {}
    ), pr)
    holder[num] = holder[num] || []
    holder[num].push(comment)
  }

  let match
  if(text && text.match && (match = text.match(/^(\s+)(.+)$/))) {
    text = <>
      <span className={classes.pre}>{match[1]}</span>{match[2]}
    </>
  }

  return (
    <div className={`${classes.line} ${type}`} key={`${type}-${num || Math.random()}`}>
      <a className={classes.link} onClick={text ? () => setShowComment(s => !s) : null} title='💬'>
        <span className={classes.number}>{num}</span>
        <span className={classes.text}>{text}</span>
      </a>
      {showComment && <Comment/>}
    </div>
  )
}