import * as React from 'react';
import calculateYears from '../../services/calculate-years';
import getSeasons from '../../services/get-seasons';
import SeasonCard from './SeasonCard/index';
import SeasonResults from './SeasonResults/index';
import { RaceSeason, ActiveSeason } from './types';
import {
  MainContainer,
  SeasonStyled,
  YearsSelect,
  SelectedSeason
} from './styles';

interface SeasonsState {
  year: number;
  years: number[];
  seasons: RaceSeason[];
  isUpdating: boolean;
  isSeasons: boolean;
  activeSeason?: ActiveSeason;
}

export default class Seasons extends React.PureComponent<{}, SeasonsState> {
  private loadingTimerId: number;

  constructor(props: any) {
    super(props);

    this.onFormChange = this.onFormChange.bind(this);
    this.state = {
      years: calculateYears(),
      year: calculateYears()[0],
      seasons: [],
      isUpdating: false,
      isSeasons: true
    };
  }

  private onFormChange(event: React.FormEvent<HTMLFormElement>): void {
    const el: HTMLInputElement = event.target as HTMLInputElement;

    this.setState({
      year: Number(el.value),
      isSeasons: true
    });
    this.load();
  }

  private showSeasonResults(season: string, round: string): void {
    this.setState({
      isSeasons: false,
      activeSeason: {
        season,
        round,
        year: String(this.state.year)
      }
    });
  }

  private toggleViews(): void {
    this.setState({
      isSeasons: !this.state.isSeasons
    });
  }

  private load(timeout: number = 50): void {
    if (this.state.isUpdating) {
      return;
    }

    clearTimeout(this.loadingTimerId);
    this.loadingTimerId = Number(
      setTimeout((): void => {
        this.setState({
          isUpdating: true
        });
        getSeasons(this.state.year)
          .then((result) => result.json())
          .then((data) => {
            this.setState({
              seasons: data.MRData.RaceTable.Races,
              isUpdating: false
            });
          })
          .catch((error) => {
            console.log(error);
            this.setState({
              isUpdating: false
            });
          });
      }, timeout)
    );
  }

  componentDidMount(): void {
    this.load();
  }

  render() {
    const { activeSeason, isSeasons } = this.state;

    return (
      <MainContainer>
        <SelectedSeason>Selected season: {this.state.year}</SelectedSeason>
        {isSeasons ? (
          <YearsSelect>
            <form onChange={this.onFormChange} className="select">
              <select name="years">
                {this.state.years.map((year: number) => (
                  <option value={year} key={year}>
                    {year}
                  </option>
                ))}
              </select>
            </form>
          </YearsSelect>
        ) : null}
        {isSeasons ? (
          <SeasonStyled>
            {this.state.seasons.map(
              ({
                season,
                round,
                Circuit,
                raceName,
                date,
                time
              }: RaceSeason) => {
                return (
                  <SeasonCard
                    raceName={raceName}
                    key={raceName}
                    onSeasonSelect={this.showSeasonResults.bind(
                      this,
                      season,
                      round
                    )}
                    circuitName={Circuit.circuitName}
                    season={season}
                    round={round}
                    country={Circuit.Location.country}
                    locality={Circuit.Location.locality}
                    circuitId={Circuit.circuitId}
                    date={date}
                    time={time}
                  />
                );
              }
            )}
          </SeasonStyled>
        ) : (
          <SeasonResults
            season={activeSeason.season}
            toggleViews={this.toggleViews.bind(this)}
            year={activeSeason.year}
            round={activeSeason.round}
          />
        )}
      </MainContainer>
    );
  }
}