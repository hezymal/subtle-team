package poker_service

type PokerVotesDTO []PokerVoteDTO

func (votes PokerVotesDTO) Len() int {
	return len(votes)
}

func (votes PokerVotesDTO) Less(i, j int) bool {
	value1 := votes[i].StoryPoint.GetValue()
	value2 := votes[j].StoryPoint.GetValue()
	return value1 < value2
}

func (votes PokerVotesDTO) Swap(i, j int) {
	votes[i], votes[j] = votes[j], votes[i]
}
