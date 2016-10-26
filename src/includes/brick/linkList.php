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

/** @var DocLinkList $linkList */
$linkList = $p['linkList'];

if (empty($linkList)){
    $brick->content = '';
    return;
}

$lst = "";
$count = $linkList->Count();
for ($i = 0; $i < $count; $i++){
    $link = $linkList->GetByIndex($i);
    $aPath = array(
        Brick::ReplaceVarByData($v['docItem'], array(
            "docTitle" => $link->docTitle,
        ))
    );

    $path = $link->path;
    for ($ii = 0; $ii < count($path); $ii++){
        $aPath[] = Brick::ReplaceVarByData($v['pathItem'], array(
            "title" => $path[$ii]->title
        ));
    }

    $elType = $link->elType;

    switch ($elType){
        case "page":
        case "section":
            $body = Brick::ReplaceVarByData($v[$elType], array(
                "title" => $link->el->title
            ));
            break;
        case "text":
            $body = Brick::ReplaceVarByData($v[$elType], array(
                "body" => $link->el->body
            ));
            break;
        default:
            $body = "";
            break;
    }
    $lst .= Brick::ReplaceVarByData($v['linkRow'], array(
        "path" => implode($v['pathDelim'], $aPath),
        "body" => $body
    ));
}

$brick->content = Brick::ReplaceVarByData($brick->content, array(
    "list" => $lst
));