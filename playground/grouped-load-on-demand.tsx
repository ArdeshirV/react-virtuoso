import * as React from 'react'
import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import * as ReactDOM from 'react-dom'
import { GroupedVirtuoso } from '../src'
import { generateGroupedUsers } from './fakeData'

// Slices the total groups to the groups
// which contain the items so far
// for example, if you have [10, 10, 10, 10]
// groups in total, slicing them to 23 will result in [10, 10, 3]
const calculateGroupsSoFar = (totalGroups: Array<any>, count: number) => {
  const groups = []
  let i = 0
  do {
    const group = totalGroups[i]
    groups.push(Math.min(group, count))
    count -= group
    i++
  } while (count > 0 && i <= totalGroups.length)
  return groups
}

const App = () => {
  const { users, groups, groupCounts } = useMemo(() => generateGroupedUsers(500), [])

  const [currentGroupCounts, setCurrentGroupCounts] = useState([])
  const loadedItems = useRef(0)
  const [loading, setLoading] = useState(false)

  const loadMore = useCallback(() => {
    setLoading(true)

    // the set timeout call is just for example purposes.
    // In the real world,
    // this can fetch and append data from a remote server.
    setTimeout(() => {
      loadedItems.current += 50
      setLoading(false)
      setCurrentGroupCounts(calculateGroupsSoFar(groupCounts, loadedItems.current))
    }, 500)
  }, [])

  useEffect(loadMore, [])

  return (
    <GroupedVirtuoso
      style={{ height: '350px', width: '400px' }}
      groupCounts={currentGroupCounts}
      rangeChanged={({ startIndex, endIndex }) => {
        console.log('rangeChanged', startIndex, endIndex)
      }}
      atBottomStateChange={atBottom => {
        console.log('at bottom', atBottom)
      }}
      group={(index: number) => <div>Group {groups[index]}</div>}
      item={(index: number) => <div>User {index}</div>}
      GroupContainer={({ children, style, ...props }) => {
        return (
          <div {...props} style={{ ...style, borderBottom: '1px solid red' }}>
            {children}
          </div>
        )
      }}
      ItemContainer={({ children, style, ...props }) => {
        return (
          <div {...props} style={{ ...style, borderBottom: '1px solid blue' }}>
            {children}
          </div>
        )
      }}
      footer={() => {
        return (
          <div
            style={{
              padding: '2rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button disabled={loading} onClick={loadMore}>
              {loading ? 'Loading...' : 'Press to load more'}
            </button>
          </div>
        )
      }}
      scrollSeek={{
        enter: (velocity, { startIndex, endIndex }) => {
          console.log('enter velocity', velocity)
          console.log('enter indexes', startIndex, endIndex)
          return Math.abs(velocity) > 100
        },
        exit: (velocity, { startIndex, endIndex }) => {
          console.log('exit velocity', velocity)
          console.log('exit indexes', startIndex, endIndex)
          return Math.abs(velocity) < 30
        },
        change: (velocity, { startIndex, endIndex }) => {
          console.log('change velocity', velocity)
          console.log('change indexes', startIndex, endIndex)
        },
        placeholder: ({ height }) => <div style={{ height }}></div>,
      }}
    />
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
