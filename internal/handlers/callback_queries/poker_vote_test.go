package callback_queries

import (
	"testing"
)

func TestParsePokerVoteData(t *testing.T) {
	storyPoint, err := parsePokerVoteData("/poker-vote STORY_POINT_05")
	if err != nil {
		t.Fatalf(`parsePokerVoteData("/poker-vote STORY_POINT_05") = '%s', '%v'`, storyPoint, err)
	}

	storyPoint, err = parsePokerVoteData("/poker-vote unknown-text")
	if err == nil {
		t.Fatalf(`parsePokerVoteData("/poker-vote unknown-text") = %s`, storyPoint)
	}

	storyPoint, err = parsePokerVoteData("")
	if err == nil {
		t.Fatalf(`parsePokerVoteData("") = %s`, storyPoint)
	}
}
