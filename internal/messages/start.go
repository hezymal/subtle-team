package messages

import (
	"fmt"

	"github.com/go-telegram/bot"
)

func GetStartCommandMessageParams(telegramChatId int64) bot.SendMessageParams {
	text := fmt.Sprintf("<strong>Бот тонкой команды:</strong>\n")
	text = fmt.Sprintf("%s/start - чтобы увидеть данное сообщение\n", text)
	text = fmt.Sprintf("%s/poker &lt;название-задачи&gt; - начать планирование", text)

	params := bot.SendMessageParams{
		ChatID:    telegramChatId,
		ParseMode: "HTML",
		Text:      text,
	}

	return params
}
