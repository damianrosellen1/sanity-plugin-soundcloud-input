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
npm install sanity-plugin-soundcloud-input
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


## License

[MIT](LICENSE) © Damian Rosellen

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
