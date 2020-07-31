import React from 'react'
import { GitHub as GitHubIcon } from '@material-ui/icons'
import { IPFSProvider } from './IPFSContext'
import DiffView from './DiffView'

export default () => (
  <IPFSProvider>
    <DiffView/>
    <a
      href='https://github.com/dhappy/cidcmp'
      style={{display: 'block', textAlign: 'center'}}
    >
      <GitHubIcon/>
    </a>
  </IPFSProvider>
)