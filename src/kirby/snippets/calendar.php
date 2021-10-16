<?php header('Content-type: text/calendar'); ?>
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//<?php echo $site->url(); ?>//Kirby Calendar Plugin//<?php echo str::upper($site->language()->code()); ?> 
METHOD:PUBLISH
<?php foreach ($site->page('events')->children() as $event): ?>
BEGIN:VEVENT
<?php
    $start = $event->content('fr')->get('start')->value();
    $start_time = strtotime($start);
    $end_time   = strtotime(Str::split($start, ' ', 2)[0] . ' ' . $event->content('fr')->get('end')->value());
    if ($end_time < $start_time) {
        $end_time += 60*60*24; // add one day
    }
?>
UID:<?php echo $event->uid() ?> 
DTSTART:<?php echo gmdate('Ymd\THis\Z', $start_time); ?> 
DTEND:<?php echo gmdate('Ymd\THis\Z', $end_time); ?> 
SUMMARY:<?php echo $event->content()->get('title')->value() ?> 
DESCRIPTION:<?php echo $event->content()->get('title')->value() ?> 
END:VEVENT
<?php endforeach; ?>
END:VCALENDAR