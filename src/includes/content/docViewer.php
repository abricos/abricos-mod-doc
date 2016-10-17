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

$docid = Doc::ParseURL();
$doc = $app->Doc($docid);

if (AbricosResponse::IsError($doc)){
    $brick->content = "";
    return;
}

Abricos::GetModule('doc')->ScriptRequireOnce('/includes/classes/docViewer.php');

$docViewer = new DocViewer($doc);
$parentid = Doc::ParseElementURL();

$title = $doc->title;
if ($parentid > 0){
    /** @var DocElPage $el */
    $el = $doc->GetEl($parentid);
    $title = $el->title;
}

$brick->content = Brick::ReplaceVarByData($brick->content, array(
    "docid" => $doc->id,
    "title" => $title,
    "result" => $docViewer->Builld($parentid),
    "brickid" => $brick->id
));

if (!empty($title)){
    $title = $title." // ".SystemModule::$instance->GetPhrases()->Get('site_name');
    Brick::$builder->SetGlobalVar('meta_title', $title);
}
