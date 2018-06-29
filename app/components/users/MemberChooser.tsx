import React from 'react';

import AutoComplete from '../common/AutoComplete';
import { User } from '../../lib/store';

interface Props {
  onChange: Function;
  selectedMemberIds?: string[];
  members: User[];
  label?: string;
  helperText?: string;
}

class MemberChooser extends React.Component<Props> {
  handleAutoCompleteChange = selectedItems => {
    this.props.onChange(selectedItems.map(i => i.value));
  };

  render() {
    const suggestions = this.props.members.map(user => ({
      label: user.displayName,
      value: user._id,
    }));

    const selectedItems = suggestions.filter(
      s => this.props.selectedMemberIds.indexOf(s.value) !== -1,
    );

    return (
      <AutoComplete
        label={this.props.label || 'Type name of Team Member'}
        helperText={this.props.helperText}
        onChange={this.handleAutoCompleteChange}
        suggestions={suggestions}
        selectedItems={selectedItems}
      />
    );
  }
}

export default MemberChooser;
