<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index()
    {
        return response()->json(
            Article::orderBy('created_at', 'desc')->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'source_url' => 'nullable|string',
            'is_updated' => 'boolean'
        ]);

        $data['slug'] = Str::slug($data['title']) . '-' . time();

        $article = Article::create($data);

        return response()->json($article, 201);
    }

    public function show(Article $article)
    {
        return response()->json($article);
    }

    public function update(Request $request, Article $article)
    {
        $article->update(
            $request->only(['title', 'content', 'is_updated'])
        );

        return response()->json($article);
    }

    public function destroy(Article $article)
    {
        $article->delete();

        return response()->json([
            'message' => 'Article deleted'
        ]);
    }
}
