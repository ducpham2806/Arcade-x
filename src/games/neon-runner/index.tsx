import React from 'react';
import type {GameComponentProps} from '../../types';
import {StandaloneGame} from '../StandaloneGame';
export const NeonRunnerGame=(props:GameComponentProps)=><StandaloneGame {...props} gameId="neon-runner" title="Neon Run — Luma" src="/standalone/neon-run/index.html"/>;
