import React from 'react';

import { User } from '../../lib/store/user';
import AutoComplete from '../common/AutoComplete';

type Props = {
  onChange: (item) => void;
  selectedMemberIds?: string[];
  members: User[];
  label?: string;
  helperText?: string;
};

class MemberChooser extends React.Component<Props> {
  public render() {
    const suggestions = this.props.members.map((user) => ({
      label: user.displayName || user.email,
      value: user._id,
    }));

    const selectedItems = suggestions.filter(
      (s) => this.props.selectedMemberIds.indexOf(s.value) !== -1,
    );

    return (
      <AutoComplete
        label={this.props.label || 'Find team member by name'}
        helperText={this.props.helperText}
        onChange={this.handleAutoCompleteChange}
        suggestions={suggestions}
        selectedItems={selectedItems}
      />
    );
  }

  private handleAutoCompleteChange = (selectedItems) => {
    this.props.onChange(selectedItems.map((i) => i.value));
  };
}

export default MemberChooser;
