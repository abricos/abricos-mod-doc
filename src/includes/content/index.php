<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

$brick = Brick::$builder->brick;
$v = &$brick->param->var;
$p = &$brick->param->param;

/** @var DocApp $app */
$app = Abricos::GetApp('doc');

$docList = $app->DocList();

$lst = "";
for ($i = 0; $i < $docList->Count(); $i++){
    $doc = $docList->GetByIndex($i);
    $lst .= Brick::ReplaceVarByData($v['row'], array(
        "docid" => $doc->id,
        "url" => $doc->GetURL(),
        "title" => $doc->title
    ));
}

$result = Brick::ReplaceVarByData($v['list'], array(
    "rows" => $lst
));

$brick->content = Brick::ReplaceVarByData($brick->content, array(
    "result" => $result,
    "brickid" => $brick->id
));