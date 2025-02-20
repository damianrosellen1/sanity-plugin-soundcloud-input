import React, {useState} from 'react'
import {Inline, Text, Button, Select, Stack, Spinner} from '@sanity/ui'

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
  // available modes: fetch, resolve and mix
  const [mode, setMode] = useState<'fetch' | 'resolve' | 'mix'>('fetch')
  const [isFetching, setIsFetching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // fetch-mode
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrackIds, setSelectedTrackIds] = useState<(number | undefined)[]>([])

  // resolve-mode
  const [resolveQueries, setResolveQueries] = useState<string[]>([''])

  // mix-mode: collection, upload-tracks und UI-states for actions inside mix-mode
  const [mixedTracks, setMixedTracks] = useState<Track[]>([])
  const [uploadTracks, setUploadTracks] = useState<Track[]>([])
  const [showUploadSelect, setShowUploadSelect] = useState(false)
  const [selectedUploadTrack, setSelectedUploadTrack] = useState<number | undefined>(undefined)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [mixUrl, setMixUrl] = useState('')

  // fetch access token
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

  // fetch-mode: Load latest uploads and sort after release_date
  const fetchTracks = async () => {
    setIsFetching(true)
    setErrorMsg('')

    const accessToken = await fetchAccessToken()
    if (!accessToken) {
      setIsFetching(false)
      return
    }

    const url = `https://api.soundcloud.com/users/${userId}/tracks?access=playable&limit=50`

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
          const sortedTracks = (data as Track[]).sort((a, b) => {
            const dateA = a.release_date ? new Date(a.release_date).getTime() : 0
            const dateB = b.release_date ? new Date(b.release_date).getTime() : 0
            return dateB - dateA
          })
          setTracks(sortedTracks)
          setErrorMsg('')
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

  // resolve-mode: resolve all selected URLs and hand over onSuccess
  const resolveAndConfirmTracks = async () => {
    setIsFetching(true)
    setErrorMsg('')

    const accessToken = await fetchAccessToken()
    if (!accessToken) {
      setIsFetching(false)
      return
    }

    const queriesToResolve = resolveQueries.filter((q) => q.trim() !== '')
    let aggregatedTracks: Track[] = []

    try {
      for (const query of queriesToResolve) {
        const url = `https://api.soundcloud.com/resolve?url=${encodeURIComponent(query)}`
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json; charset=utf-8',
          },
        })
        const data = await response.json()

        if (response.ok) {
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
          aggregatedTracks = aggregatedTracks.concat(resolvedTracks)
        } else {
          setErrorMsg(`Error fetching resolve results for URL: ${query}`)
        }
      }
      if (aggregatedTracks.length > 0) {
        onSuccess({_type: 'soundcloud', tracks: aggregatedTracks})
      } else {
        setErrorMsg('No tracks found for the provided URLs.')
      }
    } catch (error) {
      console.error('Error fetching resolve results:', error)
      setErrorMsg('Error fetching resolve results.')
    } finally {
      setIsFetching(false)
    }
  }

  // mix-mode: fetch uploaded tracks for selection
  const fetchUploadTracksForMix = async () => {
    setIsFetching(true)
    setErrorMsg('')
    const accessToken = await fetchAccessToken()
    if (!accessToken) {
      setIsFetching(false)
      return
    }
    const url = `https://api.soundcloud.com/users/${userId}/tracks?access=playable&limit=50`
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })
      const data = await response.json()
      if (response.ok && data && data.length > 0) {
        const sortedTracks = (data as Track[]).sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0
          return dateB - dateA
        })
        setUploadTracks(sortedTracks)
        setErrorMsg('')
      } else {
        setErrorMsg('No tracks found.')
      }
    } catch (error) {
      console.error('Error fetching uploads for mix:', error)
      setErrorMsg('Error fetching uploads tracks.')
    } finally {
      setIsFetching(false)
    }
  }

  // mix-mode: click handler "Add from Uploads"
  const handleAddFromUploads = async () => {
    if (uploadTracks.length === 0) {
      await fetchUploadTracksForMix()
    }
    setShowUploadSelect(true)
    setShowUrlInput(false)
  }

  // mix-mode: add selected track from uploads
  const addSelectedUploadTrack = () => {
    if (selectedUploadTrack) {
      const trackToAdd = uploadTracks.find((track) => track.id === selectedUploadTrack)
      if (trackToAdd) {
        setMixedTracks((prev) => [...prev, trackToAdd])
      }
    }
    setShowUploadSelect(false)
    setSelectedUploadTrack(undefined)
  }

  // mix-mode: click handler "Add from URL"
  const handleAddFromUrl = () => {
    setShowUrlInput(true)
    setShowUploadSelect(false)
  }

  // mix-mode: add resolved URL track
  const addTrackFromUrl = async () => {
    if (!mixUrl.trim()) return
    setIsFetching(true)
    setErrorMsg('')
    const accessToken = await fetchAccessToken()
    if (!accessToken) {
      setIsFetching(false)
      return
    }
    const url = `https://api.soundcloud.com/resolve?url=${encodeURIComponent(mixUrl)}`
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
          setMixedTracks((prev) => [...prev, ...resolvedTracks])
        } else {
          setErrorMsg('No tracks found for the provided URL.')
        }
      } else {
        setErrorMsg(`Error fetching resolve results for URL: ${mixUrl}`)
      }
    } catch (error) {
      console.error('Error adding track from URL in mix mode:', error)
      setErrorMsg('Error fetching resolve results.')
    } finally {
      setIsFetching(false)
      setShowUrlInput(false)
      setMixUrl('')
    }
  }

  // fetch-mode: handler for changes inside der Auswahl
  const handleSelectChange = (index: number, event: React.FormEvent<HTMLSelectElement>) => {
    const target = event.target as HTMLSelectElement
    const value = target.value
    const newSelectedTrackIds = [...selectedTrackIds]
    newSelectedTrackIds[index] = value ? Number(value) : undefined
    setSelectedTrackIds(newSelectedTrackIds)
  }

  // mix-mode: confirm selection
  const confirmMixedSelection = () => {
    if (mixedTracks.length > 0) {
      onSuccess({_type: 'soundcloud', tracks: mixedTracks})
    } else {
      setErrorMsg('No tracks added to the mix.')
    }
  }

  return (
    <Stack space={4}>
      {(!clientId || !clientSecret || !userId) && (
        <Inline space={[2]}>
          <Text size={2}>Missing</Text>
          <Text size={2} style={{fontWeight: 'bold'}}>
            Client ID, Client Secret oder User ID
          </Text>
        </Inline>
      )}
      {clientId && clientSecret && userId && (
        <>
          <Stack space={2}>
            <Text size={2} weight="semibold" style={{marginBottom: '2px'}}>
              Choose Track Source
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
              Latest Uploads
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
              URL
            </label>
            <label style={{display: 'block', fontSize: '14px'}}>
              <input
                type="radio"
                name="mode"
                value="mix"
                checked={mode === 'mix'}
                onChange={() => setMode('mix')}
                style={{marginRight: '8px'}}
              />
              Mixed
            </label>
          </Stack>

          {/* fetch-mode UI */}
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
                      style={{padding: '8px', fontSize: '14px'}}
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
                    onClick={() => setSelectedTrackIds([...selectedTrackIds, undefined])}
                    disabled={isFetching}
                    tone="primary"
                  />
                  <Button
                    text="Confirm Selection"
                    onClick={() => {
                      const selectedIds = selectedTrackIds.filter((id): id is number => id !== undefined)
                      const selectedTracksData = tracks.filter((track) =>
                        selectedIds.includes(track.id),
                      )
                      onSuccess({_type: 'soundcloud', tracks: selectedTracksData})
                    }}
                    disabled={selectedTrackIds.filter((id) => id !== undefined).length === 0}
                    tone="primary"
                  />
                </Stack>
              )}
            </>
          )}

          {/* resolve-mode UI */}
          {mode === 'resolve' && (
            <Stack space={3}>
              <Text size={2} weight="semibold">
                Enter URL
              </Text>
              {resolveQueries.map((query, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder="https://soundcloud.com/…"
                  value={query}
                  onChange={(e) => {
                    const newQueries = [...resolveQueries]
                    newQueries[index] = e.target.value
                    setResolveQueries(newQueries)
                  }}
                  style={{padding: '8px', fontSize: '14px', width: '100%', marginBottom: '8px'}}
                />
              ))}
              <Button
                text="Add more"
                onClick={() => setResolveQueries([...resolveQueries, ''])}
                disabled={isFetching}
                tone="primary"
              />
              <Button
                text="Confirm Selection"
                onClick={resolveAndConfirmTracks}
                disabled={isFetching || resolveQueries.every((q) => q.trim() === '')}
                tone="primary"
              />
            </Stack>
          )}

          {/* mix-mode UI */}
          {mode === 'mix' && (
            <Stack space={3}>
              <Text size={2} weight="semibold">
                Mixed Collection
              </Text>
              {mixedTracks.length > 0 && (
                <Stack space={1}>
                  <Text size={1} weight="semibold" style={{marginBottom: '4px'}}>
                    Selected Tracks
                  </Text>
                  {mixedTracks.map((track) => (
                    <Text key={track.id} size={1} style={{marginBottom: '8px', marginTop: '4px'}}>
                      {track.title} {track.release_date ? `(${track.release_date})` : ''}
                    </Text>
                  ))}
                </Stack>
              )}
              {showUploadSelect && (
                <Stack space={2}>
                  <Select
                    onChange={(e) =>
                      setSelectedUploadTrack(
                        (e.target as HTMLSelectElement).value
                          ? Number((e.target as HTMLSelectElement).value)
                          : undefined
                      )
                    }
                    value={selectedUploadTrack ? selectedUploadTrack.toString() : ''}
                    style={{padding: '8px', fontSize: '14px'}}
                  >
                    <option value="">Bitte wählen...</option>
                    {uploadTracks.map((track) => (
                      <option key={track.id} value={track.id.toString()}>
                        {track.title} {track.release_date ? `(${track.release_date})` : ''}
                      </option>
                    ))}
                  </Select>
                  <Button
                    text="Select Track"
                    onClick={addSelectedUploadTrack}
                    disabled={!selectedUploadTrack}
                    tone="primary"
                  />
                </Stack>
              )}
              {showUrlInput && (
                <Stack space={2}>
                  <input
                    type="text"
                    placeholder="SoundCloud URL eingeben"
                    value={mixUrl}
                    onChange={(e) => setMixUrl(e.target.value)}
                    style={{padding: '8px', fontSize: '14px', width: '100%'}}
                  />
                  <Button
                    text="Select Track"
                    onClick={addTrackFromUrl}
                    disabled={!mixUrl.trim()}
                    tone="primary"
                  />
                </Stack>
              )}
              <Inline space={2}>
                <Button
                  text="Add from latest Uploads"
                  onClick={handleAddFromUploads}
                  disabled={isFetching}
                  tone="primary"
                />
                <Button
                  text="Add from URL"
                  onClick={handleAddFromUrl}
                  disabled={isFetching}
                  tone="primary"
                />
              </Inline>
              <Button
                text="Confirm Selection"
                onClick={confirmMixedSelection}
                disabled={mixedTracks.length === 0}
                tone="primary"
              />
            </Stack>
          )}

          {isFetching && <Spinner muted />}
          {errorMsg && <Text style={{color: 'red'}}>Error: {errorMsg}</Text>}
        </>
      )}
    </Stack>
  )
}

export default DataFetcher
