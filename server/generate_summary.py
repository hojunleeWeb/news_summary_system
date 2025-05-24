from transformers import PreTrainedTokenizerFast, BartForConditionalGeneration

# 모델 및 토크나이저 로드 (전역 변수로 선언하여 한 번만 로드)
tokenizer = PreTrainedTokenizerFast.from_pretrained("EbanLee/kobart-summary-v3")
model = BartForConditionalGeneration.from_pretrained("EbanLee/kobart-summary-v3")

def generate_summary(text):
    inputs = tokenizer(text, return_tensors="pt", padding="max_length", truncation=True, max_length=1026)
    summary_text_ids = model.generate(
        input_ids=inputs['input_ids'],
        attention_mask=inputs['attention_mask'],
        bos_token_id=model.config.bos_token_id,
        eos_token_id=model.config.eos_token_id,
        length_penalty=1.0,
        max_length=300,
        min_length=12,
        num_beams=6,
        repetition_penalty=1.5,
        no_repeat_ngram_size=15,
    )
    
    result = tokenizer.decode(summary_text_ids[0], skip_special_tokens=True)
    print("요약 생성 결과: ", result)
    return result