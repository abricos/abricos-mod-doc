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

    public function __construct(Doc $doc){
        $this->doc = $doc;
    }

    public function Builld(){
        return $this->BuildElements(0);
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

            if (isset($this->bricks[$type])){
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
                case 'section':

                    /** @var DocElPage $el */

                    $ret .= Brick::ReplaceVarByData($brick->content, array(
                        "title" => $el->title,
                        "childs" => $this->BuildElements($element->id)
                    ));

                    break;
                case 'text':
                    /** @var DocElText $el */

                    $ret .= Brick::ReplaceVarByData($brick->content, array(
                        "body" => $el->body
                    ));
                    break;
            }
        }
        return $ret;
    }
}
