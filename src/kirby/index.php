<?php

use Kirby\Cms\PluginAssets;

Kirby::plugin('trnstn/trnstnform', [
    // plugin magic happens here
    'templates' => [
        'tform' => __DIR__ . '/templates/form.php'
    ],
    'snippets' => [
        'trnstn-ical' => __DIR__.'/snippets/calendar.php'
    ],
    'routes' => [
        [
            'pattern' => 'form/api/upcoming-shows',
            'action' => function() {
                $site = site();
                $events = $site->page('events')->children()->filter(function($e){
                    try {
                        return strtotime($e->content()->get('start')->value()) > time();
                    } catch (Exception $ex) {
                        error_log('Failed to parse date of show ' . $e->title() . ': ' . ($ex->getMessage()) );
                        return false;
                    }
                })->toArray(
                    function($e) {
                        $start = $e->content('fr')->get('start')->value();
                        $start_date = Str::split($start, ' ', 2)[0];
                        $start_time = Str::split($start, ' ', 2)[1];
                        $show = $e->content('fr')->get('related_show')->value();
                        if (empty($show)) {
                            $show = null;
                        }

                        return [
                            'id' => $e->id(),
                            'title' => $e->content()->get('title')->value(),
                            'date' => $start_date,
                            'start' => $start_time,
                            'end' => $e->content('fr')->get('end')->value(),
                            'residency' => $show
                        ];
                    }
                    
                );
                return array_values($events);
            }
        ],
        [
            'pattern' => 'form(:all)',
            'action'  => function ($path) {
                if (Str::startsWith($path,'/api/')) {
                    return $this->next();
                }

                $asset = PluginAssets::resolve('trnstn/trnstnform', $path);
                if ($asset) {
                    return $asset;
                }

                return Page::factory([
                    'slug' => 'tform',
                    'template' => 'tform',
                    'content' => [
                    ]
                ]);
            }
        ],
        [
            'pattern' => 'cal/trnstnevents.ics',
            'action' => function() {
                $site = site();
                header::download(['mime'=>'text/calendar', 'name' => 'trnstnevents.ics']);
                $data = snippet('trnstn-ical', ['site' => $site]);
                return new Response($data, 'text/calendar');
            }
        ]
    ]
]);
