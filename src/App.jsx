import React, { useState, useContext } from 'react'
import { IPFSProvider } from './IPFSContext'
import DiffView from './DiffView'

export default () => (
  <IPFSProvider>
    <DiffView/>
  </IPFSProvider>
)