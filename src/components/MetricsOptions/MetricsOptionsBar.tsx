import * as React from 'react';
import { Toolbar, ToolbarRightContent, DropdownButton, MenuItem, Icon } from 'patternfly-react';

import ValueSelectHelper from './ValueSelectHelper';
import MetricsOptions from '../../types/MetricsOptions';

interface Props {
  onOptionsChanged: (opts: MetricsOptions) => void;
  onPollIntervalChanged: (interval: number) => void;
  loading?: boolean;
}

interface MetricsOptionsState {
  pollInterval: number;
  duration: number;
  groupByLabels: string[];
}

interface GroupByLabel {
  labelIn: string;
  labelOut: string;
}

export class MetricsOptionsBar extends React.Component<Props, MetricsOptionsState> {
  static PollIntervals = [
    [0, 'Pause'],
    [5000, '5 seconds'],
    [10000, '10 seconds'],
    [30000, '30 seconds'],
    [60000, '1 minute'],
    [300000, '5 minutes']
  ];
  static DefaultPollInterval = 5000;

  static Durations: [number, string][] = [
    [300, 'Last 5 minutes'],
    [600, 'Last 10 minutes'],
    [1800, 'Last 30 minutes'],
    [3600, 'Last hour'],
    [10800, 'Last 3 hours'],
    [21600, 'Last 6 hours'],
    [43200, 'Last 12 hours'],
    [86400, 'Last day']
  ];
  static DefaultDuration = MetricsOptionsBar.Durations[1][0];

  static GroupByLabelOptions: { [key: string]: GroupByLabel } = {
    'local version': {
      labelIn: 'destination_version',
      labelOut: 'source_version'
    },
    'remote service': {
      labelIn: 'source_service',
      labelOut: 'destination_service'
    },
    'remote version': {
      labelIn: 'source_version',
      labelOut: 'destination_version'
    },
    'response code': {
      labelIn: 'response_code',
      labelOut: 'response_code'
    }
  };

  groupByLabelsHelper: ValueSelectHelper;

  constructor(props: Props) {
    super(props);

    this.groupByLabelsHelper = new ValueSelectHelper({
      items: Object.keys(MetricsOptionsBar.GroupByLabelOptions),
      onChange: this.changedGroupByLabel,
      dropdownTitle: 'Group by',
      resultsTitle: 'Grouping by:'
    });

    this.state = {
      pollInterval: MetricsOptionsBar.DefaultPollInterval,
      duration: MetricsOptionsBar.DefaultDuration,
      groupByLabels: []
    };
  }

  componentDidMount() {
    // Init state upstream
    this.reportOptions();
    this.props.onPollIntervalChanged(this.state.pollInterval);
  }

  onPollIntervalChanged = (key: number) => {
    // We use a specific handler so that changing poll interval doesn't trigger a metrics refresh in parent
    // Especially useful when pausing
    this.props.onPollIntervalChanged(key);
    this.setState({ pollInterval: key });
  };

  onDurationChanged = (key: number) => {
    this.setState({ duration: key }, () => {
      this.reportOptions();
    });
  };

  reportOptions() {
    // State-to-options converter (removes unnecessary properties)
    const labelsIn = this.state.groupByLabels.map(lbl => MetricsOptionsBar.GroupByLabelOptions[lbl].labelIn);
    const labelsOut = this.state.groupByLabels.map(lbl => MetricsOptionsBar.GroupByLabelOptions[lbl].labelOut);
    this.props.onOptionsChanged({
      duration: this.state.duration,
      byLabelsIn: labelsIn,
      byLabelsOut: labelsOut
    });
  }

  changedGroupByLabel = (labels: string[]) => {
    this.setState({ groupByLabels: labels }, () => {
      this.reportOptions();
    });
  };

  render() {
    return (
      <Toolbar>
        {this.groupByLabelsHelper.renderDropdown()}
        <div className="form-group">
          <DropdownButton id="duration" title="Duration" onSelect={this.onDurationChanged}>
            {MetricsOptionsBar.Durations.map(r => (
              <MenuItem key={r[0]} active={r[0] === this.state.duration} eventKey={r[0]}>
                {r[1]}
              </MenuItem>
            ))}
          </DropdownButton>
          <DropdownButton id="pollInterval" title="Polling interval" onSelect={this.onPollIntervalChanged}>
            {MetricsOptionsBar.PollIntervals.map(r => (
              <MenuItem key={r[0]} active={r[0] === this.state.pollInterval} eventKey={r[0]}>
                {r[1]}
              </MenuItem>
            ))}
          </DropdownButton>
        </div>
        <ToolbarRightContent>
          {this.props.loading && (
            <span>
              <Icon name="spinner" spin={true} size="lg" /> Loading
            </span>
          )}
        </ToolbarRightContent>
        {this.groupByLabelsHelper.hasResults() && (
          <Toolbar.Results>{this.groupByLabelsHelper.renderResults()}</Toolbar.Results>
        )}
      </Toolbar>
    );
  }
}

export default MetricsOptionsBar;
