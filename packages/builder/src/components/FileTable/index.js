import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { Button } from 'reactstrap'
import { sortBy } from 'lodash'

import Icon from '../Icon'
import { dataURItoIcon } from '../../logic/util/fileType'
import { sizeFromDataURI } from '../../logic/util/dataURI'

export const FileTableColGroup = () =>
  <colgroup>
    <col style={{ width: '60px' }} />
    <col style={{ width: '80%' }} />
    <col style={{ width: '20%' }} />
    <col style={{ width: '60px' }} />
  </colgroup>

export const FileTableHeader = () =>
  <thead>
    <tr>
      <th></th>
      <th>Filename</th>
      <th className="text-right">
        Size <span className="text-muted font-weight-normal">[KB]</span>
      </th>
      <th></th>
    </tr>
  </thead>

const FileTableRow = ({ path, content }, { store }) =>
  <tr>
    <td>
      <div
        className="text-muted text-center"
        style={{
          padding: '0.375rem 0.75rem',
          border: '1px solid transparent',
          lineHeight: '1.5',
        }}
      >
        <Icon
          icon={ dataURItoIcon(content) }
          fixedWidth
          style={{
            color: 'var(--secondary)',
            position: 'relative',
            top: '1px',
          }}
        />
      </div>
    </td>
    <td className="text-monospace">
      <div style={{ padding: "0.55rem 0 0.2rem" }}>
        { path }
      </div>
    </td>
    <td className="text-monospace text-right">
      <div style={{ padding: "0.55rem 0 0.2rem" }}>
        { sizeFromDataURI(content) }
      </div>
    </td>
    <td>
      <Button
        block
        outline color="muted"
        onClick={ () => store.dispatch({
          type: 'DELETE_FILE',
          file: path,
        }) }
      >
        <Icon
          icon="trash"
          fixedWidth
        />
      </Button>
    </td>
  </tr>

FileTableRow.contextTypes = {
  store: PropTypes.object
}

const _FileTableBody = ({ files, sources=['embedded-global'] }) =>
  <tbody>
    {
      sortBy(Object.entries(files), ([path, _]) => path)
        // Ignore library files (keep embedded and embedded-global)
        .filter(([_, { source }]) => sources.includes(source))
        .map(([path, { content }]) =>
          <FileTableRow
            key={ path }
            path={ path }
            content={ content }
          />
        )
    }
  </tbody>

export const FileTableBody = connect(
  state => ({
    files: state.files.files,
  })
)(_FileTableBody)
