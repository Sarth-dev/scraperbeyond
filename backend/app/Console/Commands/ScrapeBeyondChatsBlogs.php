<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;
use App\Models\Article;
use Illuminate\Support\Str;

class ScrapeBeyondChatsBlogs extends Command
{
    protected $signature = 'scrape:beyondchats';
    protected $description = 'Scrape articles from BeyondChats blog safely';

    public function handle()
    {
        $this->info('Fetching BeyondChats blogs...');

        $baseUrl = 'https://beyondchats.com';
        $response = Http::get($baseUrl . '/blogs/');

        if (!$response->successful()) {
            $this->error('Failed to fetch blog listing page');
            return;
        }

        $crawler = new Crawler($response->body());

        // ---- STEP 1: COLLECT BLOG URLs (SAFE) ----
        $blogUrls = $crawler->filter('a[href]')
            ->each(function ($node) use ($baseUrl) {
                $href = $node->attr('href');

                if (!$href || !str_contains($href, '/blogs/')) {
                    return null;
                }

                return str_starts_with($href, '/')
                    ? $baseUrl . $href
                    : $href;
            });

        $blogUrls = collect($blogUrls)
            ->filter()
            ->unique()
            ->take(5);

        // ---- STEP 2: SCRAPE EACH BLOG SAFELY ----
        foreach ($blogUrls as $url) {
            if (Article::where('source_url', $url)->exists()) {
                $this->info("Skipped (already exists): $url");
                continue;
            }

            $page = Http::get($url);

            if (!$page->successful()) {
                $this->warn("Skipped (failed fetch): $url");
                continue;
            }

            $pageCrawler = new Crawler($page->body());

            // ---- SAFE TITLE (NO EXCEPTIONS POSSIBLE) ----
            $title = trim(
                $pageCrawler->filter('h1')->text('', true)
            );

            if (empty($title)) {
                $title = trim(
                    $pageCrawler->filter('title')->text('', true)
                );
            }

            if (empty($title)) {
                $title = 'Untitled Article';
            }

            // ---- SAFE CONTENT (NO EXCEPTIONS POSSIBLE) ----
            $content = trim(
                $pageCrawler->filter('article')->text('', true)
            );

            if (empty($content)) {
                $content = trim(
                    $pageCrawler->filter('main')->text('', true)
                );
            }

            if (empty($content)) {
                $content = trim(
                    $pageCrawler->filter('body')->text('', true)
                );
            }

            // ---- FINAL VALIDATION ----
            if (strlen($content) < 200) {
                $this->warn("Skipped (content too short): $url");
                continue;
            }

            Article::create([
                'title' => $title,
                'slug' => Str::slug($title) . '-' . time(),
                'content' => $content,
                'source_url' => $url,
                'is_updated' => false,
            ]);

            $this->info("Saved: $title");
        }

        $this->info('Scraping completed successfully.');
    }
}
