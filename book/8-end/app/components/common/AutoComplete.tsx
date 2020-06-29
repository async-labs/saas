import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Downshift from 'downshift';
import keycode from 'keycode';
import React from 'react';

function renderInput(inputProps) {
  const { helperText, label, InputProps, classes, ref, ...other } = inputProps;

  // Fixing labeling transition bug.
  if (!InputProps.startAdornment || InputProps.startAdornment.length === 0) {
    delete InputProps.startAdornment;
  }

  return (
    <TextField
      helperText={helperText}
      label={label}
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

function renderSuggestion({
  suggestion,
  index,
  itemProps,
  highlightedIndex,
  selectedItems,
}: {
  suggestion: { label: string; value: string; avatarUrl: string };
  index: number;
  itemProps: any;
  highlightedIndex: number;
  selectedItems: Array<{ value: string }>;
}) {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItems || []).map((i) => i.value).indexOf(suggestion.value) > -1;

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 600 : 300,
      }}
    >
      {suggestion.label}
    </MenuItem>
  );
}

function getSuggestions(suggestions, inputValue, selectedItems) {
  let count = 0;
  const selectedValues = (selectedItems || []).map((i) => i.value);

  return suggestions.filter((suggestion) => {
    const keep =
      (!inputValue ||
        (selectedValues.indexOf(suggestion.value) === -1 &&
          suggestion.label.toLowerCase().startsWith(inputValue.replace(/^@/, '').toLowerCase()))) &&
      count < 20;

    if (keep) {
      count += 1;
    }

    return keep;
  });
}

class DownshiftMultiple extends React.Component<{
  classes: any;
  onChange: (selectedItems) => void;
  suggestions: Array<{ label: string; value: string }>;
  selectedItems: Array<{ label: string; value: string }>;
  helperText: string;
  label: string;
}> {
  public state = {
    autoFocusInput: false,
    inputValue: '',
    selectedItems: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      autoFocusInput: false,
      inputValue: '',
      selectedItems: props.selectedItems || [],
    };
  }

  public render() {
    const { classes, suggestions, helperText, label } = this.props;
    const { inputValue, selectedItems, autoFocusInput } = this.state;

    return (
      <div className={classes.root} style={{ height: 'auto', width: 'auto' }}>
        <Downshift
          inputValue={inputValue}
          onChange={this.handleChange}
          selectedItem={selectedItems}
          itemToString={(item) => item.value}
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
                fullWidth: true,
                classes,
                helperText,
                label,
                autoFocus: autoFocusInput,
                // adding key in order to re-render input, when item selected or emptied
                // re-rendering needed for fixing label transition bug
                key: `text-field-${!!selectedItems.length}`,
                InputProps: getInputProps({
                  startAdornment: selectedItems.map((item) => (
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

  public handleKeyDown = (event) => {
    const { inputValue, selectedItems } = this.state;
    if (selectedItems.length && !inputValue.length && keycode(event) === 'backspace') {
      this.setState({
        selectedItems: selectedItems.slice(0, selectedItems.length - 1),
        autoFocusInput: true,
      });

      this.props.onChange(selectedItems);
    }
  };

  public handleInputChange = (event) => {
    this.setState({ inputValue: event.target.value });
  };

  public handleChange = (item) => {
    let { selectedItems } = this.state;

    if (selectedItems.map((i) => i.value).indexOf(item.value) === -1) {
      selectedItems = [...selectedItems, item];
    }

    this.setState({
      inputValue: '',
      selectedItems,
      autoFocusInput: true,
    });

    this.props.onChange(selectedItems);
  };

  public handleDelete = (item) => () => {
    const selectedItems = [...this.state.selectedItems];
    selectedItems.splice(selectedItems.indexOf(item), 1);

    this.setState({ selectedItems });
    this.props.onChange(selectedItems);
  };
}

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    height: 100,
    width: 300,
  },
  container: {
    flexGrow: 1,
    position: 'relative' as 'relative',
  },
  paper: {
    position: 'absolute' as 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  chip: {
    margin: `${theme.spacing(0.5)}px ${theme.spacing(0.25)}px`,
  },
  inputRoot: {
    flexWrap: 'wrap' as 'wrap',
  },
});

export default withStyles(styles)(DownshiftMultiple);
