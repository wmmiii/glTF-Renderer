import * as React from 'react';

import { Author } from './Details';

interface AttributionProps {
  skyBoxCreator: Author | undefined
}

export default class Attribution extends React.Component<AttributionProps> {
  render() {
    return <div className="attribution">
      <ul>
        <li className="large">
          <a href="https://github.com/wmmiii/glTF-Renderer">glTF Renderer</a> by William Martin
        </li>
        <li>
          <a href="https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/DamagedHelmet">Damaged Helmet</a> by <a href="https://sketchfab.com/theblueturtle_">theblueturtle_</a>
        </li>
        {this.props.skyBoxCreator !== undefined &&
          <li>
            Sky Box by <a href={this.props.skyBoxCreator.url}>{this.props.skyBoxCreator.name}</a>
          </li>
        }
      </ul>
    </div >
  }
}