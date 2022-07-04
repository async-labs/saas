import React from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { User } from '../../lib/store/user';

type Props = {
  onChange: (item) => void;
  selectedMemberIds?: string[];
  members: User[];
  label?: string;
  helperText?: string;
};

type State = {
  selectedItems: { label: string; id: string }[];
};

class MemberChooser extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const suggestions = this.props.members.map((user) => ({
      label: user.displayName || user.email,
      id: user._id,
    }));

    const selectedItems = suggestions.filter(
      (s) => this.props.selectedMemberIds.indexOf(s.id) !== -1,
    );

    this.state = {
      selectedItems: selectedItems || [],
    };
  }

  public render() {
    const suggestions = this.props.members.map((user) => ({
      label: user.displayName || user.email,
      id: user._id,
    }));

    return (
      <Autocomplete
        multiple
        id="tags-standard"
        options={suggestions}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={this.state.selectedItems}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Find team member by name"
            placeholder="Select participants"
          />
        )}
        onChange={this.handleChange}
        filterSelectedOptions={true}
        noOptionsText="No team members to select from"
      />
    );
  }

  public handleChange = (event, value) => {
    event.preventDefault();

    const selectedItems = value;

    this.setState({ selectedItems });

    this.props.onChange(selectedItems.map((i) => i.id));
  };
}

export default MemberChooser;
