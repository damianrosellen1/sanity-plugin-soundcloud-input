// src/plugin.tsx
import React from 'react';
import { SoundCloudInputField } from './components/SoundCloudInputField';
import type { Config, SoundCloudFieldInput } from './utils/types';

export function soundcloudInputRendering(config: Config) {
  return {
    input: (props: SoundCloudFieldInput) => (
      <SoundCloudInputField config={config} {...props} />
    ),
  };
}
