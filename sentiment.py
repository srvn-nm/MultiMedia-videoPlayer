from transformers import pipeline

def analyze_comments(comments):
    classifier = pipeline('sentiment-analysis')
    results = []
    for comment in comments:
        result = classifier(comment)
        sentiment = result[0]['label']
        results.append((comment, sentiment))
        print(f"Comment: {comment}, Sentiment: {sentiment}")
    return results

comments = ["Great video!", "I didn't like it.", "Amazing content!", "Not my type of video."]
analyze_comments(comments)