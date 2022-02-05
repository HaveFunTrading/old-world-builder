import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
// import classNames from "classnames";

import { fetcher } from "../../utils/fetcher";
import { getMaxPercentData, getMinPercentData } from "../../utils/rules";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { List } from "../../components/list";
import { Header, Main } from "../../components/page";
import { AddUnitModal } from "./add-unit-modal/AddUnitModal";

import "./Editor.css";

const updateList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("lists"));
  const updatedLists = localLists.map((list) => {
    if (list.id === updatedList.id) {
      return updatedList;
    } else {
      return list;
    }
  });

  localStorage.setItem("lists", JSON.stringify(updatedLists));
};

export const Editor = () => {
  const { id } = useParams();
  const [army, setArmy] = useState(null);
  const [list, setList] = useState(null);
  const [addUnitModalData, setAddUnitModalData] = useState(null);
  const [editUnitModalData, setEditUnitModalData] = useState(null);
  const handleCloseModal = () => {
    setAddUnitModalData(null);
    setEditUnitModalData(null);
  };
  const handleAddUnit = (id, type) => {
    const unit = army[type].find(({ id: unitId }) => id === unitId);
    const newList = {
      ...list,
      [type]: [...list[type], unit],
    };

    setList(newList);
    updateList(newList);
    setAddUnitModalData(null);
  };
  const handleEditUnit = (newData) => {
    const { strength, type, id } = newData;
    const unit = list[type].find(({ id: unitId }) => id === unitId);
    const newUnit = {
      ...unit,
      strength,
    };
    const newList = {
      ...list,
      [type]: list[type].map((data) => {
        if (data.id === id) {
          return newUnit;
        }
        return data;
      }),
    };

    setList(newList);
    updateList(newList);
    setAddUnitModalData(null);
  };
  // const handleRemoveUnit = () => {};
  const addLord = () => {
    setAddUnitModalData({
      units: army.lords,
      type: "lords",
    });
  };
  const editLord = (unitId) => {
    setEditUnitModalData({
      unit: list.lords.find((unit) => unit.id === unitId),
      type: "lords",
    });
  };
  const addHero = () => {
    setAddUnitModalData({
      units: army.heroes,
      type: "heroes",
    });
  };
  const editHero = (unitId) => {
    setEditUnitModalData({
      unit: list.heroes.find((unit) => unit.id === unitId),
      type: "heroes",
    });
  };
  const addCore = () => {
    setAddUnitModalData({
      units: army.core,
      type: "core",
    });
  };
  const editCore = (unitId) => {
    setEditUnitModalData({
      unit: list.core.find((unit) => unit.id === unitId),
      type: "core",
    });
  };
  const addSpecial = () => {
    setAddUnitModalData({
      units: army.special,
      type: "special",
    });
  };
  const editSpecial = (unitId) => {
    setEditUnitModalData({
      unit: list.special.find((unit) => unit.id === unitId),
      type: "special",
    });
  };
  const addRare = () => {
    setAddUnitModalData({
      units: army.rare,
      type: "rare",
    });
  };
  const editRare = (unitId) => {
    setEditUnitModalData({
      unit: list.rare.find((unit) => unit.id === unitId),
      type: "rare",
    });
  };
  const getPoints = (type) => {
    let points = 0;

    list[type].forEach((unit) => {
      const unit1 = list[type].find(({ id }) => id === unit.id);
      let unitPoints = unit1.points;

      if (unit1.minimum) {
        unitPoints = unit1.strength || unit.minimum;
      }

      points += unitPoints;
    });

    return points;
  };

  useEffect(() => {
    const localLists = JSON.parse(localStorage.getItem("lists"));
    const localList = localLists.find(({ id: localId }) => id === localId);

    setList(localList);

    fetcher({
      url: `armies/${localList.game}/${localList.army}`,
      onSuccess: (data) => {
        setArmy(data);
      },
    });
  }, [id]);

  if (!list || !army) {
    return null;
  }

  const lordsPoints = getPoints("lords");
  const heroesPoints = getPoints("heroes");
  const corePoints = getPoints("core");
  const specialPoints = getPoints("special");
  const rarePoints = getPoints("rare");
  const allPoints =
    lordsPoints + heroesPoints + corePoints + specialPoints + rarePoints;
  const lordsData = getMaxPercentData({
    type: "lords",
    armyPoints: list.points,
    points: lordsPoints,
  });
  const heroesData = getMaxPercentData({
    type: "heroes",
    armyPoints: list.points,
    points: heroesPoints,
  });
  const coreData = getMinPercentData({
    type: "core",
    armyPoints: list.points,
    points: corePoints,
  });
  const specialData = getMaxPercentData({
    type: "special",
    armyPoints: list.points,
    points: specialPoints,
  });
  const rareData = getMaxPercentData({
    type: "rare",
    armyPoints: list.points,
    points: rarePoints,
  });

  return (
    <>
      <Header
        backButton
        headline={list.name}
        subheadline={`${allPoints} / ${list.points} Pkte.`}
        moreButton
      />

      <Main className="editor">
        <section className="editor__section">
          <header className="editor__header">
            <h2>Kommandanten</h2>
            <p className="editor__points">
              {lordsData.diff > 0 ? (
                <>
                  <strong>{lordsData.diff}</strong>Punkte zu viel
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{lordsData.points - lordsPoints}</strong>
                  Pkte. verfügbar
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.lords.map(({ name_de, id }, index) => (
              <List key={index} onClick={() => editLord(id)}>
                {name_de}
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={addLord}>
            <Icon symbol="add" /> Hinzufügen
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>Helden</h2>
            <p className="editor__points">
              {heroesData.diff > 0 ? (
                <>
                  <strong>{heroesData.diff}</strong> Pkte. zu viel
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{heroesData.points - heroesPoints}</strong>
                  Pkte. verfügbar
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.heroes.map(({ id, name_de }, index) => (
              <List key={index} onClick={() => editHero(id)}>
                {name_de}
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={addHero}>
            <Icon symbol="add" /> Hinzufügen
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>Kerneinheiten</h2>
            <p className="editor__points">
              {coreData.diff > 0 ? (
                <>
                  <>
                    Es fehlen<strong>{coreData.diff}</strong> Pkte.
                    <Icon symbol="error" color="red" />
                  </>
                </>
              ) : (
                <Icon symbol="check" />
              )}
            </p>
          </header>
          <ul>
            {list.core.map(({ id, strength, minimum, name_de }, index) => (
              <List key={index} onClick={() => editCore(id)}>
                {strength ? `${strength} ` : `${minimum} `}
                {name_de}
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={addCore}>
            <Icon symbol="add" /> Hinzufügen
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>Eliteeinheiten</h2>
            <p className="editor__points">
              {specialData.diff > 0 ? (
                <>
                  <strong>{specialData.diff}</strong> Pkte. zu viel
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{specialData.points - specialPoints}</strong> Pkte.
                  verfügbar <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.special.map(({ name_de }, index) => (
              <List key={index} onClick={() => editSpecial(id)}>
                {name_de}
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={addSpecial}>
            <Icon symbol="add" /> Hinzufügen
          </Button>
        </section>

        <section className="editor__section">
          <header className="editor__header">
            <h2>Seltene Einheiten</h2>
            <p className="editor__points">
              {rareData.diff > 0 ? (
                <>
                  <strong>{rareData.diff}</strong> Pkte. zu viel
                  <Icon symbol="error" color="red" />
                </>
              ) : (
                <>
                  <strong>{rareData.points - rarePoints}</strong> Pkte.
                  verfügbar
                  <Icon symbol="check" />
                </>
              )}
            </p>
          </header>
          <ul>
            {list.rare.map(({ name_de }, index) => (
              <List key={index} onClick={() => editRare(id)}>
                {name_de}
              </List>
            ))}
          </ul>
          <Button spaceBottom onClick={addRare}>
            <Icon symbol="add" /> Hinzufügen
          </Button>
        </section>
      </Main>
      {addUnitModalData && (
        <AddUnitModal
          unitData={addUnitModalData}
          onClose={handleCloseModal}
          onAdd={handleAddUnit}
        />
      )}
      {editUnitModalData && (
        <AddUnitModal
          unitData={editUnitModalData}
          onClose={handleCloseModal}
          onEdit={handleEditUnit}
        />
      )}
    </>
  );
};
