import { pluginManager } from 'perun-core';
import { name } from '../package.json'
import * as spatial from './Spatial';

pluginManager.registerPlugin(name, spatial);