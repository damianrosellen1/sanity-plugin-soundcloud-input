// @ts-nocheck
import React, { useState } from 'react'
import { Card, Inline, Button, Text, TextInput, Stack, Box } from '@sanity/ui'
import DataFetcher from './DataFetcher'
import { TrashIcon } from '@sanity/icons'
import { unset, set } from 'sanity'

interface Config {
  clientId: string
  clientSecret: string
  userId: string
}

interface InputProps {
  config: Config
  onChange: (value: any) => void
  value: any
}

const TrackItem = ({ track }: { track: any }) => {
  const [showDetails, setShowDetails] = useState(false)
  const toggleDetails = () => setShowDetails(prev => !prev)

  return (
    <Box padding={3} border style={{ borderRadius: '4px', marginBottom: '1rem' }}>
      {/* Zuerst das Bild */}
      {track.artwork_url && (
        <Box marginBottom={3}>
          <img
            src={track.artwork_url.replace('-large', '-t200x200')}
            alt="Artwork"
            style={{ width: 'auto', height: '200px', borderRadius: '2px' }}
          />
        </Box>
      )}

      {/* Dann der Titel */}
      <Stack space={2} marginBottom={3}>
        <Text size={1} weight="semibold">
          Title
        </Text>
        <TextInput readOnly value={track.title || ''} />
      </Stack>

      {/* Button zum Ein-/Ausklappen */}
      <Button
        text={showDetails ? 'Hide Details' : 'Show Details'}
        onClick={toggleDetails}
        tone="primary"
      />

      {/* Einklappbare Details */}
      {showDetails && (
        <Box marginTop={3}>
            <Stack space={1}>
              <Text size={1} weight="semibold">Track ID</Text>
              <TextInput readOnly value={track.id?.toString() || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Created At</Text>
              <TextInput readOnly value={track.created_at || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Duration</Text>
              <TextInput readOnly value={track.duration?.toString() || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Tag List</Text>
              <TextInput readOnly value={track.tag_list || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Streamable</Text>
              <TextInput readOnly value={track.streamable?.toString() || ''} />
            </Stack>
            {/* <Stack space={1}>
              <Text size={1} weight="semibold">Purchase URL</Text>
              <TextInput readOnly value={track.purchase_url || ''} />
            </Stack> */}
            <Stack space={1}>
              <Text size={1} weight="semibold">Genre</Text>
              <TextInput readOnly value={track.genre || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Description</Text>
              <TextInput readOnly value={track.description || ''} />
            </Stack>
            {/* <Stack space={1}>
              <Text size={1} weight="semibold">Release Year</Text>
              <TextInput readOnly value={track.release_year?.toString() || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Release Month</Text>
              <TextInput readOnly value={track.release_month?.toString() || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Release Day</Text>
              <TextInput readOnly value={track.release_day?.toString() || ''} />
            </Stack> */}
            <Stack space={1}>
              <Text size={1} weight="semibold">License</Text>
              <TextInput readOnly value={track.license || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">URI</Text>
              <TextInput readOnly value={track.uri || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Stream URL</Text>
              <TextInput readOnly value={track.stream_url || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Playback Count</Text>
              <TextInput readOnly value={track.playback_count?.toString() || ''} />
            </Stack>
            <Stack space={1}>
              <Text size={1} weight="semibold">Favoritings Count</Text>
              <TextInput readOnly value={track.favoritings_count?.toString() || ''} />
            </Stack>
        </Box>
      )}
    </Box>
  )
}

export const SoundCloudInputField: React.FC<InputProps> = ({ config, onChange, value }) => {
  const { clientId, clientSecret, userId } = config

  const handleReset = () => {
    onChange(unset())
  }

  const setTrackData = (data) => {
    onChange(data ? set(data) : unset())
  }

  if (!value) {
    return (
      <Card padding={4}>
        <DataFetcher
          clientId={clientId}
          clientSecret={clientSecret}
          userId={userId}
          onSuccess={setTrackData}
        />
      </Card>
    )
  }

  return (
    <Card padding={4}>
      <Stack space={4}>
        {value.tracks && value.tracks.length > 0 ? (
          value.tracks.map((track, index) => (
            <TrackItem key={track.id || index} track={track} />
          ))
        ) : (
          <Text>No tracks available.</Text>
        )}
        <Inline space={[2]}>
          <Button
            text="Reset"
            icon={TrashIcon}
            mode="ghost"
            onClick={handleReset}
            type="reset"
            tone="critical"
          />
        </Inline>
      </Stack>
    </Card>
  )
}

// Default Export hinzufügen:
export default SoundCloudInputField;
