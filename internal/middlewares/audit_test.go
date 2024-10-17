package middlewares

import "testing"

func TestGetUserActionText(t *testing.T) {
	text := shortUserActionText("/poker TASK-000")
	if text != "/poker TASK-000" {
		t.Fatalf(`getUserActionText("/poker TASK-000") = %s`, text)
	}

	text = shortUserActionText("it is so so so so very much longest long text, which cutted at 32 characters")
	if text != "it is so so so so very much long" {
		t.Fatalf(`getUserActionText("it is so so so so very much longest long text, which cutted at 32 characters") = %s`, text)
	}

	text = shortUserActionText("it is multiline\n very much longest long text, which cutted at 32 characters")
	if text != "it is multiline" {
		t.Fatalf(`getUserActionText("it is multiline\n very much longest long text, which cutted at 32 characters") = %s`, text)
	}

	text = shortUserActionText("\n")
	if text != "" {
		t.Fatalf(`getUserActionText("\n") = %v`, text)
	}

	text = shortUserActionText("")
	if text != "" {
		t.Fatalf(`getUserActionText("") = %s`, text)
	}
}
