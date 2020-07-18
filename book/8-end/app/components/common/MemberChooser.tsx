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
  public state = {
    selectedItems: [],
  };

  constructor(props) {
    super(props);

    const suggestions = this.props.members.map((user) => ({
      label: user.displayName || user.email,
      id: user._id,
    }));

    console.log(`suggestions:${suggestions}`);

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

    // console.log(this.state.selectedItems);

    return (
      <Autocomplete
        multiple
        id="tags-standard"
        options={suggestions}
        getOptionLabel={(option) => option.label}
        getOptionSelected={(option, value) => option.id === value.id}
        defaultValue={this.state.selectedItems}
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

  public handleChange = (event, value, _) => {
    event.preventDefault();

    const selectedItems = value;

    console.log(`selectedItems:${selectedItems}`);

    this.props.onChange(selectedItems.map((i) => i.id));
  };
}

export default MemberChooser;
