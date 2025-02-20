import type { ObjectInputProps, ObjectSchemaType } from 'sanity'

export interface Config {
  clientId: string
  clientSecret: string
  userId: string
}

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

export interface SoundcloudData {
  _type: 'soundcloud'
  tracks: Track[]
}

// Custom Input expects a value of type SoundcloudData.
export type SoundCloudFieldInput = ObjectInputProps<SoundcloudData, ObjectSchemaType>
