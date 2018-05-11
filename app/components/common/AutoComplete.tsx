import React from 'react';
import keycode from 'keycode';
import Downshift from 'downshift';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import { MenuItem } from 'material-ui/Menu';
import Chip from 'material-ui/Chip';

function renderInput(inputProps) {
  const { helperText, InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      helperText={helperText}
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
        },
        ...InputProps,
      }}
      {...other}
    />
  );
}

function renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItems }) {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItems || []).map(i => i.value).indexOf(suggestion.value) > -1;

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
      }}
    >
      {suggestion.label}
    </MenuItem>
  );
}

function getSuggestions(suggestions, inputValue, selectedItems) {
  let count = 0;
  const selectedValues = (selectedItems || []).map(i => i.value);

  return suggestions.filter(suggestion => {
    const keep =
      (!inputValue ||
        (selectedValues.indexOf(suggestion.value) === -1 &&
          suggestion.label.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)) &&
      count < 5;

    if (keep) {
      count += 1;
    }

    return keep;
  });
}

class DownshiftMultiple extends React.Component<{
  classes: any;
  onChange: Function;
  suggestions: [{ label: string; value: string }];
  selectedItems: [{ label: string; value: string }];
  placeholder: string;
  helperText: string;
}> {
  state = {
    inputValue: '',
    selectedItems: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      inputValue: '',
      selectedItems: props.selectedItems || [],
    };
  }

  handleKeyDown = event => {
    const { inputValue, selectedItems } = this.state;
    if (selectedItems.length && !inputValue.length && keycode(event) === 'backspace') {
      this.setState({
        selectedItems: selectedItems.slice(0, selectedItems.length - 1),
      });

      this.props.onChange(selectedItems);
    }
  };

  handleInputChange = event => {
    this.setState({ inputValue: event.target.value });
  };

  handleChange = item => {
    let { selectedItems } = this.state;

    if (selectedItems.indexOf(item) === -1) {
      selectedItems = [...selectedItems, item];
    }

    this.setState({
      inputValue: '',
      selectedItems,
    });

    this.props.onChange(selectedItems);
  };

  handleDelete = item => () => {
    const selectedItems = [...this.state.selectedItems];
    selectedItems.splice(selectedItems.indexOf(item), 1);

    this.setState({ selectedItems });
    this.props.onChange(selectedItems);
  };

  render() {
    const { classes, suggestions, placeholder, helperText } = this.props;
    const { inputValue, selectedItems } = this.state;

    return (
      <div className={classes.root}>
        <Downshift
          inputValue={inputValue}
          onChange={this.handleChange}
          selectedItem={selectedItems}
          itemToString={item => item.value}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue: inputValue2,
            selectedItem: selectedItems2,
            highlightedIndex,
          }) => (
            <div className={classes.container}>
              {renderInput({
                // fullWidth: true,
                classes,
                helperText,
                InputProps: getInputProps({
                  startAdornment: selectedItems.map(item => (
                    <Chip
                      key={item.value}
                      tabIndex={-1}
                      label={item.label}
                      className={classes.chip}
                      onDelete={this.handleDelete(item)}
                    />
                  )),
                  onChange: this.handleInputChange,
                  onKeyDown: this.handleKeyDown,
                  placeholder,
                  id: 'integration-downshift-multiple',
                }),
              })}
              {isOpen ? (
                <Paper className={classes.paper} square elevation={10}>
                  {getSuggestions(suggestions, inputValue2, selectedItems).map(
                    (suggestion, index) =>
                      renderSuggestion({
                        suggestion,
                        index,
                        itemProps: getItemProps({ item: suggestion }),
                        highlightedIndex,
                        selectedItems: selectedItems2,
                      }),
                  )}
                </Paper>
              ) : null}
            </div>
          )}
        </Downshift>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 100,
    width: 300,
  },
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  inputRoot: {
    flexWrap: 'wrap',
  },
});

export default withStyles(styles)(DownshiftMultiple);
