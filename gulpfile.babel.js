'use strict';

import gulp from 'gulp';
import workflow from 'gulp-workflow';

workflow
	.load(gulp)
	.task('lint', 'lint files', ['jshint'])
	.task('test', 'run tests', ['mocha'])
	.task('ci', 'run ci stuff', [['lint', 'test']]);
