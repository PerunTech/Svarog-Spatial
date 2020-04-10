import { pluginManager } from 'perun-core';
import { name } from '../package.json'
import { spatial } from '.';

pluginManager.registerPlugin(name, spatial);