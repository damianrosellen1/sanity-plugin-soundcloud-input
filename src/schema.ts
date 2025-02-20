// schema.ts
import {defineType} from 'sanity'

export const soundcloud = defineType({
  title: 'SoundCloud Set',
  name: 'soundcloud', // Type name used in schemas
  type: 'object',
  fields: [
    {name: 'id', title: 'Track ID', type: 'number'},
    {name: 'created_at', title: 'Created At', type: 'datetime'},
    {name: 'duration', title: 'Duration', type: 'number'},
    {name: 'tag_list', title: 'Tag List', type: 'string'},
    {name: 'streamable', title: 'Streamable', type: 'boolean'},
    {name: 'purchase_url', title: 'Purchase URL', type: 'url'},
    {name: 'genre', title: 'Genre', type: 'string'},
    {name: 'title', title: 'Title', type: 'string'},
    {name: 'description', title: 'Description', type: 'text'},
    {name: 'release_year', title: 'Release Year', type: 'number'},
    {name: 'release_month', title: 'Release Month', type: 'number'},
    {name: 'release_day', title: 'Release Day', type: 'number'},
    {name: 'license', title: 'License', type: 'string'},
    {name: 'uri', title: 'URI', type: 'url'},
    {
      name: 'user',
      title: 'User',
      type: 'object',
      fields: [
        {name: 'id', title: 'User ID', type: 'number'},
        {name: 'username', title: 'Username', type: 'string'},
        {name: 'permalink_url', title: 'Permalink URL', type: 'url'},
      ],
    },
    {name: 'artwork_url', title: 'Artwork URL', type: 'url'},
    {name: 'waveform_url', title: 'Artwork URL', type: 'url'},
    {name: 'stream_url', title: 'Stream URL', type: 'url'},
    {name: 'playback_count', title: 'Playback Count', type: 'number'},
    {name: 'favoritings_count', title: 'Favoritings Count', type: 'number'},
  ],
})
