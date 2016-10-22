<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class DocApp
 *
 * @property DocManager $manager
 */
class DocViewer {

    /**
     * @var Doc
     */
    public $doc;

    private $bricks = array();

    private $parentid = 0;

    public function __construct(Doc $doc, $parentid = 0){
        $this->doc = $doc;
        $this->parentid = intval($parentid);
    }

    public function Builld($parentid = 0){
        $parentid = intval($parentid);
        return $this->BuildElements($parentid);
    }

    public function BuildElements($parentid){
        $ret = "";
        $list = $this->doc->elementList;
        $count = $list->Count();
        for ($i = 0; $i < $count; $i++){
            $element = $list->GetByIndex($i);
            if ($element->parentid !== $parentid){
                continue;
            }

            $type = $element->type;

            if ($type === 'page' && $element->parentid === $this->parentid){
                $brick = Brick::$builder->LoadBrickS('doc', 'elPageLink');
            } else if (isset($this->bricks[$type])){
                $brick = $this->bricks[$type];
            } else {
                $brick = Brick::$builder->LoadBrickS('doc', 'el'.ucfirst($element->type));
                $this->bricks[$type] = $brick;
            }
            if (!isset($this->doc->extends[$type])){
                continue;
            }

            /** @var DocElList $elList */
            $elList = $this->doc->extends[$type];
            $el = $elList->Get($element->id);
            if (empty($el)){
                continue;
            }

            switch ($type){
                case 'page':
                    /** @var DocElPage $el */

                    if ($element->parentid === $this->parentid){
                        $ret .= Brick::ReplaceVarByData($brick->content, array(
                            "elementid" => $el->id,
                            "title" => $el->title,
                            "url" => $this->doc->GetElementURL($el->id)
                        ));
                    } else {
                        $ret .= Brick::ReplaceVarByData($brick->content, array(
                            "elementid" => $el->id,
                            "title" => $el->title,
                            "childs" => $this->BuildElements($element->id)
                        ));
                    }
                    break;
                case 'section':

                    /** @var DocElPage $el */

                    $ret .= Brick::ReplaceVarByData($brick->content, array(
                        "elementid" => $el->id,
                        "title" => $el->title,
                        "childs" => $this->BuildElements($element->id)
                    ));
                    break;
                case 'row':

                    /** @var DocElPage $el */

                    $ret .= Brick::ReplaceVarByData($brick->content, array(
                        "elementid" => $el->id,
                        "childs" => $this->BuildElements($element->id)
                    ));
                    break;
                case 'col':
                    $ret .= $this->BuildElCol($brick, $el);
                    break;
                case 'image':
                    $ret .= $this->BuildElImage($brick, $el);
                    break;
                case 'text':
                    /** @var DocElText $el */

                    $ret .= Brick::ReplaceVarByData($brick->content, array(
                        "elementid" => $el->id,
                        "body" => $el->body
                    ));
                    break;
                case 'table':
                    $ret .= $this->BuildElTable($brick, $el);
                    break;
            }
        }
        return $ret;
    }

    public function BuildElCol(Ab_CoreBrick $brick, DocElCol $el){
        $classes = array();

        $classes[] = 'col-sm-'.$el->sm;

        return Brick::ReplaceVarByData($brick->content, array(
            "elementid" => $el->id,
            "classes" => implode(' ', $classes),
            "childs" => $this->BuildElements($el->id)
        ));
    }

    public function BuildElImage(Ab_CoreBrick $brick, DocElImage $el){
        return Brick::ReplaceVarByData($brick->content, array(
            "elementid" => $el->id,
            "filehash" => $el->filehash
        ));
    }

    public function BuildElTable(Ab_CoreBrick $brick, DocElTable $el){
        $rowCount = $el->rowCount;
        $colCount = $el->colCount;

        $v = $brick->param->var;

        $cellList = $el->cellList;
        $lstHead = "";
        $rows = array();

        for ($r = 0; $r < $rowCount; $r++){
            for ($c = 0; $c < $colCount; $c++){
                $cell = $cellList->Cell($r, $c);
                if (empty($cell)){
                    continue;
                }

                if ($r === 0){
                    $lstHead .= Brick::ReplaceVarByData($v['th'], array(
                        "body" => $cell->body
                    ));
                } else {
                    if ($c === 0){
                        $rows[$r - 1] = "";
                    }
                    $rows[$r - 1] .= Brick::ReplaceVarByData($v['td'], array(
                        "body" => $cell->body
                    ));
                }
            }
        }

        $lst = "";
        for ($i = 0; $i < count($rows); $i++){
            $lst .= Brick::ReplaceVarByData($v['tr'], array(
                "cols" => $rows[$i]
            ));
        }

        return Brick::ReplaceVarByData($brick->content, array(
            "elementid" => $el->id,
            "heads" => $lstHead,
            "rows" => $lst
        ));
    }
}
