// @ts-nocheck
import React, {useState} from 'react'
import {Inline, Text, Button, Stack, Spinner, Select} from '@sanity/ui'

export interface Track {
  id: number
  title: string
  release_date?: string
}

export interface SoundcloudData {
  _type: 'soundcloud'
  tracks: Track[]
}

interface DataFetcherProps {
  clientId: string
  clientSecret: string
  userId: string
  onSuccess: (data: SoundcloudData) => void
}

const DataFetcher: React.FC<DataFetcherProps> = ({clientId, clientSecret, userId, onSuccess}) => {
  const [mode, setMode] = useState<'fetch' | 'resolve'>('fetch')
  const [isFetching, setIsFetching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrackIds, setSelectedTrackIds] = useState<(number | undefined)[]>([])
  const [resolveQuery, setResolveQuery] = useState('')
  const [resolveResponse, setResolveResponse] = useState<any>(null)

  const fetchAccessToken = async (): Promise<string | null> => {
    const tokenUrl = 'https://api.soundcloud.com/oauth2/token'
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      userId: userId,
      grant_type: 'client_credentials',
    })

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json; charset=utf-8',
        },
        body,
      })

      const data = await response.json()

      if (data.access_token) {
        return data.access_token
      } else {
        setErrorMsg(
          (data.error || 'Failed to obtain access token.') + ' Status: ' + response.status,
        )
        return null
      }
    } catch (error) {
      console.error('Error fetching access token:', error)
      setErrorMsg('Error obtaining access token')
      return null
    }
  }

  // Call latest track and sort for release_date afterwards
  const fetchTracks = async () => {
    setIsFetching(true)
    setErrorMsg('')

    const accessToken = await fetchAccessToken()
    if (!accessToken) {
      setIsFetching(false)
      return
    }

    // Track URL with limit=50, maximum is 200.
    // Params: https://developers.soundcloud.com/docs/api/explorer/open-api#/users/get_users__user_id__tracks
    const url = `https://api.soundcloud.com/users/${userId}/tracks?access=playable&limit=50`

    // Note:
    // It's not possible to search for title or other params inside user tracks, SoundCloud API is limited.
    // If you have a lot of tracks you'll reach API rate limits very easily.
    // Thats why I chose to set limit=50 instead of 200 and add a resolve function for URLs.

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        if (data && data.length > 0) {
          // Sort after release date
          const sortedTracks = (data as Track[]).sort((a, b) => {
            const dateA = a.release_date ? new Date(a.release_date).getTime() : 0
            const dateB = b.release_date ? new Date(b.release_date).getTime() : 0
            return dateB - dateA
          })
          setTracks(sortedTracks)
          setErrorMsg('')
          // Initial empty select field
          setSelectedTrackIds([undefined])
        } else {
          setErrorMsg('No tracks found.')
        }
      } else {
        if (data.errors && data.errors[0] && data.errors[0].error_message) {
          setErrorMsg(`API Error: ${data.errors[0].error_message}`)
        } else {
          setErrorMsg('Unknown error occurred while fetching tracks.')
        }
      }
    } catch (error) {
      console.error('Error fetching tracks:', error)
      setErrorMsg('There was an error fetching tracks.')
    } finally {
      setIsFetching(false)
    }
  }

  const fetchResolveTracks = async () => {
    setIsFetching(true)
    setErrorMsg('')
    setResolveResponse(null)

    const accessToken = await fetchAccessToken()
    if (!accessToken) {
      setIsFetching(false)
      return
    }

    // Resolve URL (no params possible)
    const url = `https://api.soundcloud.com/resolve?url=${encodeURIComponent(resolveQuery)}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json; charset=utf-8',
        },
      })
      const data = await response.json()

      if (response.ok) {
        setResolveResponse(data)
        let resolvedTracks: Track[] = []

        if (data.kind === 'track') {
          resolvedTracks = [data]
        } else if (data.kind === 'playlist' && data.tracks) {
          resolvedTracks = data.tracks
        } else if (data.collection && Array.isArray(data.collection)) {
          resolvedTracks = data.collection
        } else if (Array.isArray(data)) {
          resolvedTracks = data
        }

        if (resolvedTracks.length > 0) {
          setTracks(resolvedTracks)
          setErrorMsg('')
          onSuccess({_type: 'soundcloud', tracks: resolvedTracks})
        } else {
          setErrorMsg(
            'No tracks found for the resolve query. URL: ' + encodeURIComponent(resolveQuery),
          )
        }
      } else {
        setErrorMsg('Error fetching resolve results. URL: ' + encodeURIComponent(resolveQuery))
      }
    } catch (error) {
      console.error('Error fetching resolve results:', error)
      setErrorMsg('Error fetching resolve results.')
    } finally {
      setIsFetching(false)
    }
  }

  // Handler for changes of a single select field
  const handleSelectChange = (index: number, event: React.FormEvent<HTMLSelectElement>) => {
    const target = event.target as HTMLSelectElement
    const value = target.value
    const newSelectedTrackIds = [...selectedTrackIds]
    newSelectedTrackIds[index] = value ? Number(value) : undefined
    setSelectedTrackIds(newSelectedTrackIds)
  }

  // Add another select field
  const addAnotherSelect = () => {
    setSelectedTrackIds([...selectedTrackIds, undefined])
  }

  // Confirm and load track selection
  const confirmSelection = () => {
    const selectedIds = selectedTrackIds.filter((id): id is number => id !== undefined)
    const selectedTracksData = tracks.filter((track) => selectedIds.includes(track.id))
    onSuccess({_type: 'soundcloud', tracks: selectedTracksData})
  }

  return (
    <Stack space={4}>
      {(!clientId || !clientSecret || !userId) && (
        <Inline space={[2]}>
          <Text size={2}>Missing</Text>
          <Text size={2} style={{fontWeight: 'bold'}}>
            Client ID, Client Secret or User ID
          </Text>
        </Inline>
      )}
      {clientId && clientSecret && userId && (
        <>
          <Stack space={2}>
            <Text size={2} weight="semibold" style={{marginBottom: '2px'}}>
              Load Tracks
            </Text>
            <label style={{display: 'block', fontSize: '14px'}}>
              <input
                type="radio"
                name="mode"
                value="fetch"
                checked={mode === 'fetch'}
                onChange={() => setMode('fetch')}
                style={{marginRight: '8px'}}
              />
              From Latest Uploads
            </label>
            <label style={{display: 'block', fontSize: '14px'}}>
              <input
                type="radio"
                name="mode"
                value="resolve"
                checked={mode === 'resolve'}
                onChange={() => setMode('resolve')}
                style={{marginRight: '8px'}}
              />
              From URL (https://soundcloud.com/…)
            </label>
          </Stack>

          {mode === 'fetch' && (
            <>
              <Button
                text="Load Tracks"
                onClick={fetchTracks}
                disabled={isFetching}
                tone="primary"
              />
              {tracks.length > 0 && (
                <Stack space={3}>
                  {selectedTrackIds.map((selectedId, index) => (
                    <Select
                      key={index}
                      onChange={(e) => handleSelectChange(index, e)}
                      value={selectedId ? selectedId.toString() : ''}
                    >
                      <optgroup label="Tracks">
                        <option value="">Bitte wählen...</option>
                        {tracks.map((track) => (
                          <option key={track.id} value={track.id.toString()}>
                            {track.title} {track.release_date ? `(${track.release_date})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    </Select>
                  ))}
                  <Button
                    text="Add more"
                    onClick={addAnotherSelect}
                    disabled={isFetching}
                    tone="primary"
                  />
                  <Button
                    text="Confirm"
                    onClick={confirmSelection}
                    disabled={selectedTrackIds.filter((id) => id !== undefined).length === 0}
                    tone="primary"
                  />
                </Stack>
              )}
            </>
          )}

          {mode === 'resolve' && (
            <Stack space={3}>
              <Text size={2} weight="semibold">
                Suche
              </Text>
              <input
                type="text"
                placeholder="Suchwort oder URL eingeben"
                value={resolveQuery}
                onChange={(e) => setResolveQuery(e.target.value)}
                style={{padding: '8px', fontSize: '14px', width: '100%'}}
              />
              <Button
                text="Resolve Tracks"
                onClick={fetchResolveTracks}
                disabled={isFetching || !resolveQuery}
                tone="primary"
              />
            </Stack>
          )}

          {isFetching && <Spinner muted />}

          {errorMsg && <Text style={{color: 'red'}}>Error: {errorMsg}</Text>}

          {resolveResponse && (
            <div style={{marginTop: '16px'}}>
              <Text size={2} weight="semibold">
                Vollständige JSON-Antwort:
              </Text>
              <pre
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: '8px',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {JSON.stringify(resolveResponse, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </Stack>
  )
}

export default DataFetcher
