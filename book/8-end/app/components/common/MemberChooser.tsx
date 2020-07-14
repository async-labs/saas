import React from 'react';

import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import { User } from '../../lib/store/user';

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
      <Autocomplete
        multiple
        id="tags-standard"
        options={suggestions}
        getOptionLabel={(option) => option.label}
        defaultValue={selectedItems}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Find team member by name"
            placeholder="Select participants"
          />
        )}
        onChange={this.handleAutoCompleteChange}
      />
    );
  }

  private handleAutoCompleteChange = (selectedItems) => {
    this.props.onChange(selectedItems.map((i) => i.value));
  };
}

export default MemberChooser;
