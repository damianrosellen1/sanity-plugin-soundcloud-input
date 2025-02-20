# sanity-plugin-soundcloud-input

> This is a **Sanity Studio v3** plugin for importing SoundCloud content to your sanity project.

## Features
+ Connect your SoundCloud Application with your sanity project
+ Select one or more tracks from the latest uploaded tracks
+ Load a track from URL

![preview](https://cdn.sanity.io/images/gqfbb293/production/c4ea200bd090e4d7e483f9326f5e886cba3a7251-640x548.gif)


## Upcoming

+ Load combined content, from URL and from uploads


## Requirements

For using this plugin you need the following:

1. A SoundCloud Account
2. A registered SoundCloud Application. You can register a new one using the support chat bot at [help.soundcloud.com](https://help.soundcloud.com/hc/de/requests/new?ticket_form).
3. The SoundCloud Application Credentials (Client ID, Client Secret and Website URI)
4. Your SoundCloud UserID. It can be retreiced using the [SoundCloud Public API Specification Page](https://developers.soundcloud.com/docs/api/explorer/open-api). You have to authorize via your Application Credentials with **oAuth2_1 (OAuth2, clientCredentials)** to [get your user_id](https://developers.soundcloud.com/docs/api/explorer/open-api#/users/get_users__user_id_).


## Installation

```sh
npm install sanity-plugin-soundcloud-input
```

## Usage

Create a .env file in your sanity directory and add the following

```ts
SANITY_STUDIO_SOUNDCLOUD_CLIENT_ID=YOUR_CLIENT_ID
SANITY_STUDIO_SOUNDCLOUD_CLIENT_SECRET=YOUR_CLIENT_SECRET
SANITY_STUDIO_SOUNDCLOUD_URI=YOUR_URI
SANITY_STUDIO_SOUNDCLOUD_USER_ID=YOUR_USER_ID
```

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {soundcloudInput} from 'sanity-plugin-soundcloud-input'

export default defineConfig({
  //...
  plugins: [
    soundcloudInput({
      clientId: process.env.SANITY_STUDIO_SOUNDCLOUD_CLIENT_ID,
      clientSecret: process.env.SANITY_STUDIO_SOUNDCLOUD_CLIENT_SECRET,
      userId: process.env.SANITY_STUDIO_SOUNDCLOUD_USER_ID,
    }),
  ],
})
```

## License

[MIT](LICENSE) © Damian Rosellen

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
