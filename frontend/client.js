import { pluginManager } from 'perun-core';
import pkg from '../package.json'
import { spatial } from '.';

pluginManager.registerPlugin(pkg.name, spatial);