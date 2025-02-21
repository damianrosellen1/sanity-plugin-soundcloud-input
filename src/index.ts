// src/index.ts
import { definePlugin, defineType } from 'sanity';
import { soundcloudInputRendering } from './plugin';
import { soundcloud } from './schema';
import type { Config } from './utils/types';
import type { ObjectInputProps, ObjectSchemaType } from 'sanity';

const defaultConfig: Config = {
  clientId: '',
  clientSecret: '',
  userId: '',
  websiteURI: '',
};

export const soundcloudInput = definePlugin<Config | void>((userConfig) => {
  const config = { ...defaultConfig, ...userConfig };

  if (!config.clientId || !config.clientSecret || !config.userId || !config.websiteURI) {
    console.warn(
      'SoundCloud Plugin: Missing clientId, clientSecret or userId. Please pass them in the configuration.'
    );
  }

  return {
    name: 'sanity-plugin-soundcloud-input',
    schema: {
      types: [
        defineType({
          ...soundcloud,
          components: {
            input: soundcloudInputRendering(config).input as unknown as React.ComponentType<
              ObjectInputProps<Record<string, any>, ObjectSchemaType>
            >,
          },
        }),
      ],
    },
  };
});
