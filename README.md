# sanity-plugin-soundcloud-input

> This is a **Sanity Studio v3** plugin for importing SoundCloud content to your sanity project.

## Features

- Connect your SoundCloud Application with your sanity project
- Select one or more tracks from your latest uploads
- Select one or more tracks from a soundcloud URL
- Create a mixed collection from uploads and URLs

## Requirements

For using this plugin you need the following:

1. A SoundCloud Account
2. A registered SoundCloud Application. You can register a new one using the support chat bot at [help.soundcloud.com](https://help.soundcloud.com/hc/de/requests/new?ticket_form).
3. The SoundCloud Application Credentials (Client ID, Client Secret and Website URI)
4. Your SoundCloud UserID. It can be retreiced using the [SoundCloud Public API Specification Page](https://developers.soundcloud.com/docs/api/explorer/open-api). You have to authorize via your Application Credentials with **oAuth2_1 (OAuth2, clientCredentials)** to [get your user_id](https://developers.soundcloud.com/docs/api/explorer/open-api#/users/get_users__user_id_).

## Installation

```sh
npm install @damianrosellen/sanity-plugin-soundcloud-input
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {soundcloudInput} from 'sanity-plugin-soundcloud-input'

export default defineConfig({
  //...
  plugins: [soundcloudInput({})],
})
```

Add it to your schemas:

```
{
  name: 'soundcloud',
  type: 'soundcloud',
  title: 'SoundCloud Content',
  group: 'soundcloud',
},
```

Set up your API Credentials in the API Settings and you're ready to go.

## Data

The Plugin will provide an array:

```ts
export interface SoundcloudData {
  _type: 'soundcloud'
  tracks: Track[]
}
```

of objects:

```ts
export interface Track {
  id: number
  created_at: string
  duration: number
  tag_list: string
  streamable: boolean
  purchase_url?: string
  genre: string
  title: string
  description: string
  release_year: number
  release_month: number
  release_day: number
  license: string
  uri: string
  user: {
    id: number
    username: string
    permalink_url: string
  }
  artwork_url?: string
  waveform_url?: string
  stream_url: string
  playback_count: number
  favoritings_count: number
}
```

You can use `stream_url` for the [SoundCloud Widget API](https://developers.soundcloud.com/docs/api/html5-widget).

If you want to use the track artwork in your frontend, you canreplace the end of the image-link with your desired resolution up to 500 pixels, for example 200x200 pixels:

```html
  <img :src="`${track.artwork_url.replace('-large', '-t200x200')}`" alt="Artwork"/>
```

Or use the original file:

```html
  <img :src="`${track.artwork_url.replace('-large', '-original')}`" alt="Artwork"/>
```


## License

[MIT](LICENSE) © Damian Rosellen

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
