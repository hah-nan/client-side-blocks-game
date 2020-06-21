import React from 'react'
import modals from './modals.js'
import Select from 'react-select';

const initialNextOptions = [
  { value: 'sequential', label: 'Next in list' },
  { value: 'end', label: 'End Scenario' },
  { value: 'disable', label: 'Disable Scenario' },
];

const conditionTypeOptions = [
  { value: 'matchJSON', label: 'matchJSON' },
  { value: 'insideOfObjectWithTag', label: 'insideOfObjectWithTag' },
  { value: 'hasTag', label: 'hasTag' },
  { value: 'hasMod', label: 'hasMod' },
  { value: 'hasSubObject', label: 'hasSubObject' },
  { value: 'isSubObjectEquipped', label: 'isSubObjectEquipped' },
  { value: 'isSubObjectInInventory', label: 'isSubObjectInInventory' },
  { value: 'hasCompletedQuest', label: 'hasCompletedQuest' },
  { value: 'hasStartedQuest', label: 'hasStartedQuest' },
  { value: 'duringTime', label: 'duringTime' },
]

export default class ScenarioItem extends React.Component{
  constructor(props) {
    super(props)
    const { scenarioItem } = this.props;

    this.state = {
      scenarioItem: {...scenarioItem},
      nextOptions: initialNextOptions,
    }

    this._selectNext = this._selectNext.bind(this)
    this._addOption = this._addOption.bind(this)
    this._onAddConditionTestId = this._onAddConditionTestId.bind(this)
    this._onAddConditionTestTag = this._onAddConditionTestTag.bind(this)
    this._onToggleValue = this._onToggleValue.bind(this)
    this._openWriteDialogueModal = this._openWriteDialogueModal.bind(this)
    this._openEditCodeModal = this._openEditCodeModal.bind(this)
    this._openEditConditionValueModal = this._openEditConditionValueModal.bind(this)
    this._onChangeConditionType = this._onChangeConditionType.bind(this)
  }

  componentDidMount() {
    this._updateNextOptions()
  }

  componentDidUpdate(prevProps) {
    if(prevProps.scenarioList.length !== this.props.scenarioList.length) {
      this._updateNextOptions()
    }
  }

  getItemValue() {
    return this.state.scenarioItem
  }

  _updateNextOptions() {
    const { scenarioList } = this.props;

    this.setState({
      nextOptions: initialNextOptions.concat(scenarioList.map((scenarioItem) => {
        return {
          value: scenarioItem.id,
          label: 'Go to ' + scenarioItem.id
        }
      }))
    })
  }

  _openEditCodeModal() {
    const { scenarioItem } = this.state;

    modals.openEditCodeModal('edit condition JSON', scenarioItem.conditionJSON, (result) => {
      if(result && result.value) {
        scenarioItem.conditionJSON = JSON.parse(result.value)
        this.setState({scenarioItem})
      }
    })
  }

  _openEditConditionValueModal() {
    const { scenarioItem } = this.state;

    modals.openEditTextModal('edit condition value', scenarioItem.conditionValue, (result) => {
      if(result && result.value) {
        scenarioItem.conditionValue = result.value
        this.setState({scenarioItem})
      }
    })
  }

  _onChangeConditionType(event) {
    const { scenarioItem } = this.state;
    scenarioItem.conditionType = event.value
    this.setState({scenarioItem})
  }

  _openWriteDialogueModal(index) {
    const { scenarioItem } = this.state;

    let initial = ''
    if(scenarioItem.type === 'dialogue') {
      initial = scenarioItem.effectValue
    }
    if(scenarioItem.type === 'branchChoice') {
      initial = scenarioItem.options[index].effectValue
    }

    modals.openWriteDialogueModal(initial, (result) => {

      if(scenarioItem.type === 'dialogue') {
        this.setState({
          scenarioItem: {...scenarioItem, effectValue: result.value}
        })
      }

      if(scenarioItem.type === 'branchChoice') {
        scenarioItem.options[index].effectValue = result.value
        this.setState({scenarioItem})
      }
    })
  }

  _selectNext(event, prop) {
    const { scenarioItem } = this.state;
    if(scenarioItem.type === 'dialogue') {
      scenarioItem.next = event.value
    }
    if(scenarioItem.type === 'branchChoice') {
      scenarioItem.options[prop].next = event.value
    }
    if(scenarioItem.type === 'branchCondition') {
      scenarioItem[prop] = event.value
    }
    this.setState({scenarioItem})
  };

  _addOption() {
    const { scenarioItem } = this.state;
    const newOptions = scenarioItem.options.slice()
    newOptions.push({ effectValue: '', next: 'sequential' })
    scenarioItem.options = newOptions
    this.setState(scenarioItem)
  }

  _onAddConditionTestId(event) {
    const { scenarioItem } = this.state;
    scenarioItem.testIds = event.map(({value}) => value)
    this.setState(scenarioItem)
  }

  _onAddConditionTestTag(event) {
    const { scenarioItem } = this.state;
    scenarioItem.testTags = event.map(({value}) => value)
    this.setState(scenarioItem)
  }

  _onToggleValue(value) {
    const { scenarioItem } = this.state;
    scenarioItem[value] = !scenarioItem[value]
    this.setState(scenarioItem)
  }

  _renderDialogue() {
    const { scenarioItem } = this.state;
    return <div className="ScenarioItem__dialogue">
      <i className="fa fas fa-edit ScenarioButton" onClick={this._openWriteDialogueModal}/>
      Dialogue: <div className="ScenarioItem__summary">{scenarioItem.effectValue}</div>
      {this._renderNextSelect(scenarioItem.next, this._selectNext)}
    </div>
  }

  _renderChoice() {
    const { scenarioItem } = this.state;
    return <div className="ScenarioItem__choice">
      {scenarioItem.options.map((option, index) => {
        return <div key={scenarioItem.id + '-' + index} className="ScenarioItem__option" >
          <h4>{'Option ' + (index + 1)}</h4>
          <i className="fa fas fa-edit ScenarioButton" onClick={() => {
            this._openWriteDialogueModal(index)
          }}/>
        Text:<div className="ScenarioItem__summary">{option.effectValue}</div>
          {this._renderNextSelect(option.next, (event) => {
            this._selectNext(event, index)
          })}
        </div>
      })}
      <i className="fa fas fa-plus ScenarioButton" onClick={this._addOption}/>
    </div>
  }

  _renderCondition() {
    const { scenarioItem } = this.state
    const { conditionType } = scenarioItem

    const conditionTypeChooser = <div className="ScenarioItem__condition-type-chooser">
      Type: <Select
        value={{value: conditionType, label: conditionType}}
        onChange={this._onChangeConditionType}
        options={conditionTypeOptions}
        styles={window.reactSelectStyle}
        theme={window.reactSelectTheme}/>
    </div>

    let chosenConditionForm
    if(conditionType === 'matchJSON') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditCodeModal}/>
        <div className="ScenarioItem__summary ScenarioItem__summary--json">{JSON.stringify(scenarioItem.conditionJSON)}</div>
      </div>
    }
    if(conditionType === 'insideOfObjectWithTag' || conditionType === 'hasTag') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditConditionValueModal}/>
        Tag: <div className="ScenarioItem__summary ScenarioItem__summary--json">{scenarioItem.conditionValue}</div>
      </div>
    }
    if(conditionType === 'hasSubObject' || conditionType === 'isSubObjectEquipped' || conditionType === 'isSubObjectInInventory') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditConditionValueModal}/>
        Sub Object name: <div className="ScenarioItem__summary ScenarioItem__summary--json">{scenarioItem.conditionValue}</div>
      </div>
    }
    if(conditionType === 'hasCompletedQuest' || conditionType === 'hasStartedQuest') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditConditionValueModal}/>
        Quest name: <div className="ScenarioItem__summary ScenarioItem__summary--json">{scenarioItem.conditionValue}</div>
      </div>
    }
    if(conditionType === 'hasMod') {
      chosenConditionForm = <div className="ScenarioItem__condition-form"><i className="fa fas fa-edit ScenarioButton" onClick={this._openEditConditionValueModal}/>
        Mod: <div className="ScenarioItem__summary ScenarioItem__summary--json">{scenarioItem.conditionValue}</div>
      </div>
    }

    const selectConditionTestIds = <div className="ScenarioItem__test">Test Ids:<Select
      value={scenarioItem.testIds.map((id) => { return {value: id, label: id} })}
      onChange={this._onAddConditionTestId}
      options={GAME.objects.map(({id}) => { return {value: id, label: id} }).concat(GAME.heroList.map(({id}) => { return { value: id, label: id} }))}
      styles={window.reactSelectStyle}
      isMulti
      theme={window.reactSelectTheme}/>
    </div>

    const selectConditionTestTags = <div className="ScenarioItem__test">Test Tags:<Select
      value={scenarioItem.testTags.map((tags) => { return { value: tags, label: tags} })}
      onChange={this._onAddConditionTestTag}
      options={Object.keys(window.allTags).map(tag => { return { value: tag, label: tag}})}
      styles={window.reactSelectStyle}
      isMulti
      theme={window.reactSelectTheme}/>
    </div>

    return <div className="ScenarioItem__condition">
          {conditionTypeChooser}
          <div className="ScenarioItem__condition-body">
            {chosenConditionForm}
            <div className="ScenarioItem__condition-input"><input onClick={() => this._onToggleValue('testMainObject')} value={scenarioItem.testMainObject} type="checkbox"></input>Test Main Object</div>
            <div className="ScenarioItem__condition-input"><input onClick={() => this._onToggleValue('testGuestObject')} value={scenarioItem.testGuestObject} type="checkbox"></input>Test Guest Object</div>
            {selectConditionTestIds}
            {selectConditionTestTags}
            <div className="ScenarioItem__condition-input"><input onClick={() => this._onToggleValue('allTestedMustPass')} value={scenarioItem.allTestedMustPass} type="checkbox"></input>All Tested Must Pass</div>
          </div>
          {this._renderNextSelect(scenarioItem.passNext, (event) => {
            this._selectNext(event, 'passNext')
          }, 'Pass Next:')}
          {this._renderNextSelect(scenarioItem.failNext, (event) => {
            this._selectNext(event, 'failNext')
          }, 'Fail Next:')}
        </div>
  }

  _renderNextSelect(nextValue, onChange, title) {
    const { scenarioItem, nextOptions } = this.state;

    const selectedNext = nextOptions.filter((option) => {
      if(option.value === nextValue) return true
    })[0]

    return <div className="ScenarioItem__next">{title || 'Next:'}<Select
      value={selectedNext}
      onChange={onChange}
      options={nextOptions}
      styles={window.reactSelectStyle}
      theme={window.reactSelectTheme}/></div>
  }

  render() {
    const { scenarioItem } = this.state;
    const { onDelete } = this.props;

    return (
      <div className="ScenarioItem">
        <div className="ScenarioItem__identifier">{scenarioItem.id}</div>
        <div className="ScenarioItem__type">{scenarioItem.type}</div>
        <i className="ScenarioButton ScenarioItem__delete fa fas fa-times" onClick={onDelete}></i>
        <div className="ScenarioItem__body">
          {scenarioItem.type == 'dialogue' && this._renderDialogue()}
          {scenarioItem.type == 'branchChoice' && this._renderChoice()}
          {scenarioItem.type == 'branchCondition' && this._renderCondition()}
          {scenarioItem.type == 'effect' && this._renderEffect()}
        </div>
      </div>
    )
  }
}
