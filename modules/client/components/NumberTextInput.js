import React, { PropTypes } from 'react'
import { parseNumber, formatNumber } from '../NumberUtils'

class NumberTextInput extends React.Component {
  static propTypes = {
    value: PropTypes.number,
    parseNumber: PropTypes.func,
    formatNumber: PropTypes.func
  }

  static defaultProps = {
    value: 0,
    parseNumber,
    formatNumber
  }

  componentWillMount = () =>
    this.setState({ value: this.props.value })

  handleChange = (event) => {
    const value = this.props.parseNumber(event.target.value)

    this.setState({ value }, () => {
      if (this.props.onChange)
        this.props.onChange(value)
    })
  }

  render = () => {
    const { value } = this.state
    const displayValue = this.props.formatNumber(value)

    return (
      <input {...this.props} type="text" value={displayValue} onChange={this.handleChange}/>
    )
  }
}

export default NumberTextInput
